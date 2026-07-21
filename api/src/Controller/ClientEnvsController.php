<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ClientEnvsController extends AbstractController
{
	#[Route("/client/pwa-support.js", methods: ["GET"])]
	public function show(
		#[Autowire(param: "posthog.key")]
		string $posthogKey,
		#[Autowire(param: "posthog.host")]
		string $posthogHost,
		#[Autowire(param: "app.base_url")]
		string $baseUrl,
		#[Autowire(param: "app.support_email")]
		string $supportEmail,
		#[Autowire(param: "auth.dev_login_key")]
		string $devLoginKey = null,
	): Response {
		$envs = [
			"VITE_API_URL" => "/api",
			"VITE_POSTHOG_KEY" => $posthogKey,
			"VITE_POSTHOG_HOST" => $posthogHost,
			"VITE_BASE_URL" => $baseUrl,
			"VITE_SUPPORT_EMAIL" => $supportEmail,
			"VITE_DEV_LOGIN_KEY" => $devLoginKey,
		];

		return new Response(
			content: "globalThis.runtimeEnv = " . json_encode($envs) . ";",
			headers: [
				"Content-Type" => "application/javascript"
			],
		);
	}
}
