<?php

namespace App\Doctrine\ORM\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

/**
 * Add support for Postgre Trigram's extension Similarity function
 * @see https://www.postgresql.org/docs/current/pgtrgm.html#PGTRGM-FUNCS-OPS
 */
class TrgmSimilarityFunction extends FunctionNode
{
	protected Node $first;
	protected Node $second;

	public function getSql(SqlWalker $sqlWalker): string
	{
		return sprintf(
			"similarity(%s, %s)",
			$this->first->dispatch($sqlWalker),
			$this->second->dispatch($sqlWalker),
		);
	}

	public function parse(Parser $parser): void
	{
		$parser->match(TokenType::T_IDENTIFIER);
		$parser->match(TokenType::T_OPEN_PARENTHESIS);

		$this->first = $parser->ArithmeticPrimary();
		$parser->match(TokenType::T_COMMA);

		$this->second = $parser->ArithmeticPrimary();
		$parser->match(TokenType::T_CLOSE_PARENTHESIS);
	}
}
