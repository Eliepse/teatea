<?php

namespace App\Controller;

use App\Entity\Token;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Generator\RefreshTokenGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
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
readonly class OTPAuthController
{
	private \DateInterval $otpTtl;

	public function __construct(
		private UserRepository $userRepository,
		private JWTTokenManagerInterface $JWTManager,
		private RefreshTokenGeneratorInterface $refreshTokenGenerator,
		private EntityManagerInterface $em,
		private TokenManager $tokenManager,
		#[Autowire("%gesdinet_jwt_refresh_token.ttl%")]
		private int $ttl,
		private MailerInterface $mailer,
		#[Autowire("%app.base_url%")]
		private string $baseUrl,
	) {
		$this->otpTtl = new \DateInterval("PT10M");
	}

	#[Route("/auth/login", methods: ["POST"])]
	public function requestToken(Request $request): Response
	{
		$payload = json_decode($request->getContent(), true);
		$email = $payload["email"] ?? null;

		if (null === filter_var($email, FILTER_VALIDATE_EMAIL, FILTER_NULL_ON_FAILURE)) {
			throw new BadRequestHttpException("Invalid email");
		}

		$user = $this->userRepository->findOneBy(["email" => $email]);

		$this->tokenManager->collectGarbage();

		if (null !== $user) {
			$token = $this->tokenManager->createToken(
				Token::TYPE_OTP,
				$user,
				new \DateTimeImmutable()->add($this->otpTtl),
			);

			$this->mailer->send(
				new Email()->from("teatea@eliepse.fr")->to($email)->subject("Login to your account")->html(
					<<<HTML
						To login, please follow this link:<br/>
						<a href="$this->baseUrl/login/$token->challenge">$this->baseUrl/login/$token->challenge</a>
						HTML,

				),
			);
		} else {
			// Pretend creation to reduce timing attack
			$fakeUser = $this->em->getReference(User::class, 0);
			usleep(rand(5, 20) * 1_000);
			$this->tokenManager->generateTokenWithSalt("nop", $fakeUser, new \DateTimeImmutable(), "not-a-salt");
		}

		return new Response(status: 204);
	}

	#[Route("/auth/otp/{challenge}", requirements: ["challenge" => "[0-9a-zA-Z]{42}"], methods: ["POST"], format: "application/json",)]
	public function validate(string $challenge): JsonResponse
	{
		$token = $this->tokenManager->validateChallenge($challenge, Token::TYPE_OTP);

		if (null === $token) {
			throw new NotFoundHttpException();
		}

		$jwt = $this->JWTManager->create($token->owner);
		$refreshToken = $this->refreshTokenGenerator->createForUserWithTtl($token->owner, $this->ttl);

		$this->em->remove($token);
		$this->em->flush();

		return new JsonResponse(
			[
				"token" => $jwt,
				"refresh_token" => $refreshToken->getRefreshToken(),
				"refresh_token_expiration" => $refreshToken->getValid()->getTimestamp(),
			],
		);
	}
}
