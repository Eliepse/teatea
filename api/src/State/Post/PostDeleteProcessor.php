<?php

namespace App\State\Post;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\Social\Post;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class PostDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
    )
    {
    }


    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        $user = $this->security->getUser();

        assert($data instanceof Post);
        assert($user instanceof User);

        $entity = $this->em->find(\App\Entity\Social\Post::class, $data->id);

        if (null === $entity) {
            throw new \RuntimeException("Cannot delete an post that can't be found (id: $data->id)");
        }

        $this->em->remove($entity);

        foreach ($entity->media as $media) {
            $this->em->remove($media);
        }

        $this->em->flush();
    }
}
