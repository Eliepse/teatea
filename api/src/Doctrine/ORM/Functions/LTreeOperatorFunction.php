<?php

namespace App\Doctrine\ORM\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

class LTreeOperatorFunction extends FunctionNode
{
	protected Node $first;
	protected $operator;
	protected Node $second;

	public function getSql(SqlWalker $sqlWalker): string
	{
		//		if (false === in_array($this->operator, ["@>", "<@", "~", "?", "||", "@", "?~", "?@"])) {
		//			throw new ParserException("Invalid ltree operator: $this->operator");
		//		}

		return sprintf(
			"(%s %s %s)",
			$this->first->dispatch($sqlWalker),
			$this->operator,
			$this->second->dispatch($sqlWalker),
		);
	}

	public function parse(Parser $parser): void
	{
		$parser->match(TokenType::T_IDENTIFIER);
		$parser->match(TokenType::T_OPEN_PARENTHESIS);

		$this->first = $parser->ArithmeticPrimary();
		$parser->match(TokenType::T_COMMA);

		$lexer = $parser->getLexer();

		$this->operator = $lexer->lookahead->value;
		$lexer->moveNext();

		if ("," !== ($token = $lexer->lookahead->value)) {
			$this->operator .= $token;
		}

		$parser->match(TokenType::T_COMMA);

		$this->second = $parser->ArithmeticPrimary();
		$parser->match(TokenType::T_CLOSE_PARENTHESIS);
	}
}
