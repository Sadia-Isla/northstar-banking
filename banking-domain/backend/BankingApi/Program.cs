using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

var authSection = builder.Configuration.GetSection(AuthenticationOptions.SectionName);
var authOptions = authSection.Get<AuthenticationOptions>() ?? new AuthenticationOptions();

builder.Services.Configure<AuthenticationOptions>(authSection);
builder.Services.AddSingleton(authOptions);
builder.Services.AddSingleton<NorthstarBankApi.Data.BankingRepository>();
builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authOptions.Authority;
        options.Audience = authOptions.Audience;
        options.RequireHttpsMetadata = authOptions.RequireHttpsMetadata;
    });
builder.Services.AddAuthorization(options =>
{
    if (authOptions.Enabled)
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    }
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

public sealed class AuthenticationOptions
{
    public const string SectionName = "Authentication";

    public bool Enabled { get; init; }
    public string Authority { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public bool RequireHttpsMetadata { get; init; } = true;
}
