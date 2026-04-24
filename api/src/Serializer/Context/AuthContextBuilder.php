<?php

namespace App\Serializer\Context;

use ApiPlatform\State\SerializerContextBuilderInterface;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

#[AsDecorator("api_platform.serializer.context_builder")]
final readonly class AuthContextBuilder implements SerializerContextBuilderInterface
{
	private SerializerContextBuilderInterface $decorated;
	private AuthorizationCheckerInterface $authorizationChecker;

	public function __construct(
		SerializerContextBuilderInterface $decorated,
		AuthorizationCheckerInterface $authorizationChecker,
	) {
		$this->decorated = $decorated;
		$this->authorizationChecker = $authorizationChecker;
	}

	public function createFromRequest(Request $request, bool $normalization, ?array $extractedAttributes = null): array
	{
		$context = $this->decorated->createFromRequest($request, $normalization, $extractedAttributes);

		if (!isset($context['groups'])) {
			return $context;
		}

		$context['groups'][] = $this->authorizationChecker->isGranted('ROLE_USER') ? "auth:member" : "auth:guest";
		return $context;
	}
}
