<?php

namespace App\Doctrine\ORM\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

/**
 * Doctrine don't support COALESCE function on Where and OrderBy clauses,
 * this version is used as numeric function and allow such use
 */
class CoalesceNumericFunction extends FunctionNode
{
	/**
	 * @var Node[]
	 */
	protected array $args = [];

	public function getSql(SqlWalker $sqlWalker): string
	{
		return sprintf("COALESCE(%s)", join(",", array_map(fn($arg) => $arg->dispatch($sqlWalker), $this->args)));
	}

	public function parse(Parser $parser): void
	{
		$parser->match(TokenType::T_IDENTIFIER);
		$parser->match(TokenType::T_OPEN_PARENTHESIS);

		// Process ScalarExpressions (1..N)
		$this->args[] = $parser->ScalarExpression();

		while ($parser->getLexer()->isNextToken(TokenType::T_COMMA)) {
			$parser->match(TokenType::T_COMMA);

			$this->args[] = $parser->ScalarExpression();
		}

		$parser->match(TokenType::T_CLOSE_PARENTHESIS);
	}
}
