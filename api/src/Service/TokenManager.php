<?php

namespace App\Service;

use App\DTO\Auth\GeneratedToken;
use App\Entity\Token;
use App\Entity\User;
use App\Exception\Auth\ExpiredTokenException;
use App\Exception\Auth\InvalidTokenException;
use App\Repository\TokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final readonly class TokenManager
{
	private const int KEY_LENGTH = 24;

	public function __construct(
		#[Autowire("%env(string:JWT_SECRET_KEY)%")]
		private string $signingKey,
		private EntityManagerInterface $em,
		private TokenRepository $tokenRepository,
	)
	{
	}

	public function generateTokenWithSalt(string $type, User $owner, \DateTimeImmutable $expiredAt, string $salt): GeneratedToken
	{
		$key = $this->generateRandomString(self::KEY_LENGTH);
		$payload = [$salt, $type, $owner->id, $expiredAt->getTimestamp()];
		$encodedPayload = base64_encode(serialize($payload));

		$token = new Token($owner, $key, $this->sign($encodedPayload), $expiredAt);
		return new GeneratedToken("$key$salt", $token);
	}

	public function createToken(string $type, User $owner, \DateTimeImmutable $expiredAt): GeneratedToken
	{
		$tokenDTO = $this->generateTokenWithSalt($type, $owner, $expiredAt, $this->generateRandomString(18));

		$this->em->persist($tokenDTO->token);
		$this->em->flush();

		return $tokenDTO;
	}

	/**
	 * Check the challenge and return the associated token on success.
	 *
	 * @param string $challenge
	 * @param string $type
	 * @return Token|null
	 */
	public function validateChallenge(string $challenge, string $type): ?Token
	{
		$key = substr($challenge, 0, self::KEY_LENGTH);
		$salt = substr($challenge, self::KEY_LENGTH);

		$token = $this->tokenRepository->findTokenFromKey($key);

		if (null === $token) {
			throw new InvalidTokenException();
		}

		if ($token->isExpired()) {
			throw new ExpiredTokenException();
		}

		return $this->verifySignature($token, $type, $salt) ? $token : null;
	}

	public function collectGarbage(): void
	{
		$this->tokenRepository->removeExpiredTokens();
	}

	private function verifySignature(Token $token, string $type, string $salt): bool
	{
		$generatedTokenDTO = $this->generateTokenWithSalt($type, $token->owner, $token->expiredAt, $salt);
		return hash_equals($token->signature, $generatedTokenDTO->token->signature);
	}

	private function sign(string $encodedPayload): string
	{
		return base64_encode(hash_hmac('sha256', $encodedPayload, $this->signingKey, true));
	}

	private function generateRandomString(int $size = 32): string
	{
		return substr(bin2hex(random_bytes($size)), 0, $size);
	}
}
