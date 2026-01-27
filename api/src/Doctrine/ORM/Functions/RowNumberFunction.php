<?php

namespace App\Doctrine\ORM\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

/**
 * Add support for Postgres ROW_NUMBER window function
 * @see https://www.postgresql.org/docs/17/functions-window.html
 */
class RowNumberFunction extends FunctionNode
{
	protected Node $windowDefinition;
	protected Node $second;

	public function getSql(SqlWalker $sqlWalker): string
	{
		//		dd($this->windowDefinition, $this->windowDefinition->dispatch($sqlWalker));
		return sprintf("ROW_NUMBER() OVER (%s)", $this->windowDefinition->dispatch($sqlWalker));
	}

	public function parse(Parser $parser): void
	{
		$parser->match(TokenType::T_IDENTIFIER);
		$parser->match(TokenType::T_OPEN_PARENTHESIS);

		$this->windowDefinition = $parser->OrderByClause();

		$parser->match(TokenType::T_CLOSE_PARENTHESIS);
	}
}
