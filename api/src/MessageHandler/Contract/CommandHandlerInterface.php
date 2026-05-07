<?php

namespace App\MessageHandler\Contract;


use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('messenger.message_handler', ['bus' => 'command.bus'])]
interface CommandHandlerInterface
{

}
