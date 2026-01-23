<?php

namespace App\Controller;

use App\Entity\Token;
use App\Entity\User;
use App\Exception\Auth\ExpiredTokenException;
use App\Exception\Auth\InvalidTokenException;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use App\Security\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class OTPAuthController extends AbstractController
{
	private \DateInterval $otpTtl;
	private \DateInterval $otpChallengeTtl;

	public function __construct(
		private UserRepository $userRepository,
		private JWTTokenManagerInterface $JWTManager,
		private EntityManagerInterface $em,
		private TokenManager $tokenManager,
		private TokenRepository $tokenRepo,
		#[Autowire("%auth.refresh_token.ttl%")]
		private int $refreshTokenTtl,
		private MailerInterface $mailer,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
	) {
		$this->otpTtl = new \DateInterval("PT15M");
		$this->otpChallengeTtl = new \DateInterval("PT5M");
	}

	#[Route("/auth/login", name: "login.check", methods: ["POST"])]
	public function requestToken(Request $request): Response
	{
		$payload = json_decode($request->getContent(), true);
		$email = $payload["email"] ?? null;

		if (null === filter_var($email, FILTER_VALIDATE_EMAIL, FILTER_NULL_ON_FAILURE)) {
			throw new BadRequestHttpException("Invalid email");
		}

		$user = $this->userRepository->findOneBy(["email" => $email]);

		$this->tokenManager->collectGarbage();

		// No user
		if (null === $user) {
			// Pretend creation to reduce timing attack
			$fakeUser = new User();
			$fakeUser->id = 0;
			usleep(rand(5, 20) * 1_000);

			// Do not persist! (only to mitigate timing attacks)
			$fakeOTP = $this->tokenManager->makeToken(
				"do_not_persist_this_token",
				$fakeUser,
				new \DateTimeImmutable()->add($this->otpTtl),
				null,
			);
			$this->tokenManager->makeToken(
				"do_not_persist_this_token_2",
				$fakeUser,
				new \DateTimeImmutable()->add($this->otpChallengeTtl),
				null,
			);

			// Pretend it worked to mislead attacker
			return $this->json([
				"token" => $fakeOTP->challenge,
				"expiredAt" => $fakeOTP->token->expiredAt,
			]);
		}

		// Inactive OTP token
		// Once valid, allow to retreive authentication tokens
		$OTPToken = $this->tokenManager->createToken(
			Token::TYPE_OTP,
			$user,
			new \DateTimeImmutable()->add($this->otpTtl),
			null,
		);

		// Used to activate the OTP token
		$OTPChallengeToken = $this->tokenManager->makeToken(
			Token::TYPE_OTP_CHALLENGE,
			$user,
			new \DateTimeImmutable()->add($this->otpChallengeTtl),
			new \DateTimeImmutable(),
		);
		$OTPChallengeToken->token->challengeFor = $OTPToken->token;
		$this->em->persist($OTPChallengeToken->token);
		$this->em->flush();

		$link = "$this->baseUrl/login/verify/$OTPChallengeToken->challenge";
		$this->mailer->send(
			new Email()
				->from("elie.meignan@eliepse.fr")
				->to($email)
				->subject("Login to your account")
				->html(
					<<<HTML
					To login, please follow this link:<br/>
					<a href="$link">$link</a>
					HTML,
				),
		);

		return $this->json([
			"token" => $OTPToken->challenge,
			"expiredAt" => $OTPToken->token->expiredAt,
		]);
	}

	/**
	 * Use the OTP token to authenticate and return the authentication tokens
	 */
	#[Route("/auth/otp", name: "login.otp", methods: ["POST"], format: "application/json")]
	public function login(Request $request): JsonResponse
	{
		$challenge = $request->toArray()["challenge"] ?? null;

		if (empty($challenge) || 1 !== preg_match("/^[0-9a-z]{50}$/i", $challenge)) {
			return $this->json(["message" => "Token invalid or expired"], 404);
		}

		try {
			$token = $this->tokenManager->validateChallenge($challenge, Token::TYPE_OTP);
		} catch (ExpiredTokenException) {
			return $this->json(["message" => "Token expired"], 404);
		} catch (InvalidTokenException) {
			return $this->json(["message" => "Token invalid"], 403);
		}

		if (null === $token) {
			return $this->json(["message" => "Token invalid or expired"], 404);
		}

		$jwt = $this->JWTManager->create($token->owner);
		$refreshToken = $this->tokenManager->createToken(
			Token::TYPE_JWT_REFRESH,
			$token->owner,
			new \DateTimeImmutable()->add(new \DateInterval("PT{$this->refreshTokenTtl}S")),
			new \DateTimeImmutable(),
		);

		$this->em->remove($token);
		$this->em->flush();

		return $this->json([
			"token" => $jwt,
			"refresh_token" => $refreshToken->challenge,
			"refresh_token_expiration" => $refreshToken->token->expiredAt?->getTimestamp(),
		]);
	}

	/**
	 * Verify a OTP Challenge token to activate the actual OTP token
	 */
	#[Route("/auth/otp/verify", name: "login.verify", methods: ["POST"], format: "application/json")]
	public function verify(Request $request): Response
	{
		$challenge = $request->toArray()["challenge"] ?? null;

		if (empty($challenge) || 1 !== preg_match("/^[0-9a-z]{50}$/i", $challenge)) {
			return $this->json(["message" => "Token invalid or expired"], 404);
		}

		try {
			$challengeToken = $this->tokenManager->validateChallenge($challenge, Token::TYPE_OTP_CHALLENGE);
		} catch (InvalidTokenException|ExpiredTokenException) {
			$challengeToken = null;
		}

		if (null === $challengeToken) {
			return $this->json(["message" => "Token invalid or expired"], 404);
		}

		$OTPToken = $challengeToken->challengeFor;

		if (null === $OTPToken || $OTPToken->isExpired()) {
			$this->tokenRepo->removeExpiredTokens();
			return $this->json(["message" => "Token invalid or expired"], 404);
		}

		$this->tokenRepo->validateToken($OTPToken);

		return new Response(status: 204);
	}

	/**
	 * Logging autmatically in dev env
	 */
	#[Route(
		"/auth/dev/{token}",
		name: "login.dev",
		requirements: ["token" => "[A-Za-z0-9]+"],
		methods: ["POST"],
		format: "application/json",
		env: "dev",
	)]
	public function loginDev(
		string $token,
		#[Autowire(param: "auth.dev_login_key")]
		string $devKey,
		UserRepository $userRepo,
	): JsonResponse {
		if (empty($token) || empty(trim($devKey)) || $token !== $devKey) {
			throw new NotFoundHttpException();
		}

		$admin = $userRepo
			->createQueryBuilder("admin")
			->where("RIGHT_EXISTS_ON_LEFT(admin.roles, :role) = TRUE")
			->setParameter("role", "ROLE_ADMIN")
			->orderBy("admin.id")
			->setMaxResults(1)
			->getQuery()
			->getSingleResult();

		$jwt = $this->JWTManager->create($admin);
		$refreshToken = $this->tokenManager->createToken(
			Token::TYPE_JWT_REFRESH,
			$admin,
			new \DateTimeImmutable()->add(new \DateInterval("PT{$this->refreshTokenTtl}S")),
			new \DateTimeImmutable(),
		);

		return $this->json([
			"token" => $jwt,
			"refresh_token" => $refreshToken->challenge,
			"refresh_token_expiration" => $refreshToken->token->expiredAt?->getTimestamp(),
		]);
	}
}
