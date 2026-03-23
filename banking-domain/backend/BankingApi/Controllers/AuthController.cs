using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NorthstarBankApi.Models;

namespace NorthstarBankApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthenticationOptions _options;

    public AuthController(AuthenticationOptions options)
    {
        _options = options;
    }

    [AllowAnonymous]
    [HttpGet("session")]
    public IActionResult GetSession()
    {
        return Ok(new ApiSession(
            _options.Enabled,
            User.Identity?.IsAuthenticated ?? false,
            User.Identity?.Name,
            User.FindFirstValue("sub") ?? User.FindFirstValue(ClaimTypes.NameIdentifier),
            User.Identity?.AuthenticationType));
    }
}
