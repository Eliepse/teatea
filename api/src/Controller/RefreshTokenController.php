<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\Auth\RefreshTokenRequestPayload;
use App\Entity\Token;
use App\Exception\Auth\ExpiredTokenException;
use App\Exception\Auth\InvalidTokenException;
use App\Security\TokenManager;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Attribute\Route;

class RefreshTokenController extends AbstractController
{
	#[Route("/auth/token/refresh", methods: ["POST"])]
	public function refreshToken(
		#[MapRequestPayload(acceptFormat: "json")] RefreshTokenRequestPayload $payload,
		TokenManager $tokenManager,
		JWTTokenManagerInterface $JWTManager,
	): JsonResponse {
		try {
			$refreshToken = $tokenManager->validateChallenge($payload->refresh_token, Token::TYPE_JWT_REFRESH);
		} catch (ExpiredTokenException|InvalidTokenException) {
			throw new AccessDeniedHttpException();
		}

		if (null === $refreshToken) {
			throw new AccessDeniedHttpException();
		}

		$jwt = $JWTManager->create($refreshToken->owner);

		return $this->json([
			"token" => $jwt,
			"refresh_token" => $payload->refresh_token,
			"refresh_token_expiration" => $refreshToken->expiredAt?->getTimestamp(),
		]);
	}
}
