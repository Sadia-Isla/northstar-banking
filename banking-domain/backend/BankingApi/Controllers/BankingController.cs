using NorthstarBankApi.Data;
using NorthstarBankApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace NorthstarBankApi.Controllers;

[ApiController]
[Route("api/banking")]
public class BankingController : ControllerBase
{
    private readonly BankingRepository _repo;

    public BankingController(BankingRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("overview")]
    public IActionResult GetOverview()
    {
        return Ok(_repo.GetSnapshot());
    }

    [HttpGet("accounts")]
    public IActionResult GetAccounts()
    {
        return Ok(_repo.GetAccounts());
    }

    [HttpGet("transactions")]
    public IActionResult GetTransactions([FromQuery] string? search, [FromQuery] string? direction)
    {
        return Ok(_repo.GetTransactions(search, direction));
    }

    [HttpGet("transactions/{id:int}")]
    public IActionResult GetTransaction(int id)
    {
        var transaction = _repo.GetTransactionById(id);
        return transaction is null ? NotFound() : Ok(transaction);
    }

    [HttpPost("transactions")]
    public IActionResult CreateTransaction([FromBody] UpsertTransactionRequest request)
    {
        var validationResult = Validate(request);

        if (validationResult is not null)
        {
            return validationResult;
        }

        var created = _repo.CreateTransaction(request);
        return CreatedAtAction(nameof(GetTransaction), new { id = created.Id }, created);
    }

    [HttpPut("transactions/{id:int}")]
    public IActionResult UpdateTransaction(int id, [FromBody] UpsertTransactionRequest request)
    {
        var validationResult = Validate(request);

        if (validationResult is not null)
        {
            return validationResult;
        }

        var updated = _repo.UpdateTransaction(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("transactions/{id:int}")]
    public IActionResult DeleteTransaction(int id)
    {
        return _repo.DeleteTransaction(id) ? NoContent() : NotFound();
    }

    private BadRequestObjectResult? Validate(UpsertTransactionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Date) ||
            string.IsNullOrWhiteSpace(request.Description) ||
            string.IsNullOrWhiteSpace(request.Category) ||
            string.IsNullOrWhiteSpace(request.Account) ||
            string.IsNullOrWhiteSpace(request.Direction) ||
            string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "All transaction fields are required." });
        }

        if (!request.Direction.Equals("credit", StringComparison.OrdinalIgnoreCase) &&
            !request.Direction.Equals("debit", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Direction must be either credit or debit." });
        }

        return null;
    }
}
