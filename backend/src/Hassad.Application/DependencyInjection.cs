using Hassad.Application.Admin;
using Hassad.Application.Auth;
using Hassad.Application.Insights;
using Hassad.Application.Predictions;
using Hassad.Application.Profiles;
using Hassad.Application.Weather;
using Microsoft.Extensions.DependencyInjection;

namespace Hassad.Application;

public static class DependencyInjection
{
    /// <summary>Registers the use-case services. Called once from Program.cs.</summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IPredictionService, PredictionService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IInsightService, InsightService>();
        services.AddScoped<IWeatherService, WeatherService>();
        return services;
    }
}
