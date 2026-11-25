using Hassad.Application.Common.Interfaces;
using Hassad.Application.Weather;
using Hassad.Infrastructure.Ai;
using Hassad.Infrastructure.Email;
using Hassad.Infrastructure.Persistence;
using Hassad.Infrastructure.Persistence.Repositories;
using Hassad.Infrastructure.Security;
using Hassad.Infrastructure.Weather;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Hassad.Infrastructure;

public static class DependencyInjection
{
    /// <summary>Connects every Application interface to its real implementation. Called once from Program.cs.</summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // Database
        services.AddDbContext<AppDbContext>(o => o.UseSqlServer(config.GetConnectionString("DefaultConnection")));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPredictionRepository, PredictionRepository>();

        // Settings (checked at startup, so a missing secret fails fast instead of at the first request)
        services.AddOptions<JwtOptions>().Bind(config.GetSection(JwtOptions.SectionName))
            .Validate(o => o.Key.Length >= 32, "Jwt:Key must be at least 32 characters. Set it with dotnet user-secrets.")
            .ValidateOnStart();
        services.Configure<EmailOptions>(config.GetSection(EmailOptions.SectionName));
        services.Configure<AiModelOptions>(config.GetSection(AiModelOptions.SectionName));
        services.Configure<OpenAiOptions>(config.GetSection(OpenAiOptions.SectionName));

        // Security & time
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        // Email
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        // Outside HTTP APIs (typed clients: one HttpClient per service, managed by IHttpClientFactory)
        var aiTimeout = config.GetValue(AiModelOptions.SectionName + ":TimeoutSeconds", 180);
        services.AddHttpClient<IAiPredictionClient, AiPredictionClient>(c => c.Timeout = TimeSpan.FromSeconds(aiTimeout));
        services.AddHttpClient<IAiTextClient, OpenAiTextClient>(c => c.Timeout = TimeSpan.FromSeconds(60));
        services.AddHttpClient<IWeatherClient, OpenMeteoWeatherClient>(c => c.Timeout = TimeSpan.FromSeconds(30));

        return services;
    }
}
