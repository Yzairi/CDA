using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Back_end.Data;
using Back_end.Enums;
using Microsoft.EntityFrameworkCore;

namespace Back_end.Controllers
{
    /// <summary>
    /// Contrôleur pour les statistiques de l'application immobilière
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        /// <summary>
        /// Initialise une nouvelle instance du contrôleur des statistiques
        /// </summary>
        /// <param name="context">Contexte de base de données</param>
        public StatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Modèle de réponse pour le résumé des statistiques
        /// </summary>
        /// <param name="TotalUsers">Nombre total d'utilisateurs</param>
        /// <param name="ActiveUsers">Nombre d'utilisateurs actifs</param>
        /// <param name="TotalProperties">Nombre total de propriétés</param>
        /// <param name="DraftProperties">Nombre de propriétés en brouillon</param>
        /// <param name="PublishedProperties">Nombre de propriétés publiées</param>
        /// <param name="ArchivedProperties">Nombre de propriétés archivées</param>
        /// <param name="AveragePublishDelayMinutes">Délai moyen de publication en minutes</param>
        public record StatsSummary(
            int TotalUsers,
            int ActiveUsers,
            int TotalProperties,
            int DraftProperties,
            int PublishedProperties,
            int ArchivedProperties,
            double? AveragePublishDelayMinutes
        );

        /// <summary>
        /// Récupère un résumé des statistiques générales de l'application
        /// </summary>
        /// <returns>Résumé des statistiques incluant les utilisateurs et propriétés</returns>
        /// <response code="200">Statistiques récupérées avec succès</response>
        /// <response code="401">Non autorisé - Token JWT requis</response>
        /// <response code="403">Accès interdit - Privilèges administrateur requis</response>
        [HttpGet("summary")]
        [Authorize]
        public async Task<ActionResult<StatsSummary>> GetSummary()
        {
            // basic admin check
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            if (!string.Equals(isAdminClaim, "true", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var users = await _context.Users.ToListAsync();
            var properties = await _context.Properties.ToListAsync();

            int totalUsers = users.Count;
            int activeUsers = users.Count(u => u.Status == UserStatus.ACTIVE);

            int totalProps = properties.Count;
            int draft = properties.Count(p => p.Status == PropertyStatus.DRAFT);
            int published = properties.Count(p => p.Status == PropertyStatus.PUBLISHED);
            int archived = properties.Count(p => p.Status == PropertyStatus.ARCHIVED);

            // average time from created to published for published properties (minutes)
            var publishDurations = properties.Where(p => p.Status == PropertyStatus.PUBLISHED && p.PublishedAt != null)
                                             .Select(p => (p.PublishedAt!.Value - p.CreatedAt).TotalMinutes)
                                             .ToList();
            double? avgMinutes = publishDurations.Count > 0 ? Math.Round(publishDurations.Average(), 1) : null;

            var summary = new StatsSummary(
                totalUsers,
                activeUsers,
                totalProps,
                draft,
                published,
                archived,
                avgMinutes
            );

            return Ok(summary);
        }

        /// <summary>
        /// Modèle pour un point dans le temps avec un compteur
        /// </summary>
        /// <param name="Date">Date du point</param>
        /// <param name="Count">Nombre cumulé à cette date</param>
        public record TimelinePoint(DateOnly Date, int Count);
        
        /// <summary>
        /// Modèle de réponse pour les données de timeline
        /// </summary>
        /// <param name="Users">Timeline cumulative des utilisateurs</param>
        /// <param name="Properties">Timeline cumulative des propriétés</param>
        /// <param name="PublishedProperties">Timeline cumulative des propriétés publiées</param>
        public record TimelineResponse(IEnumerable<TimelinePoint> Users, IEnumerable<TimelinePoint> Properties, IEnumerable<TimelinePoint> PublishedProperties);

        /// <summary>
        /// Récupère les données de timeline pour l'évolution des utilisateurs et propriétés
        /// </summary>
        /// <returns>Données de timeline cumulatives par jour</returns>
        /// <response code="200">Timeline récupérée avec succès</response>
        /// <response code="401">Non autorisé - Token JWT requis</response>
        /// <response code="403">Accès interdit - Privilèges administrateur requis</response>
        [HttpGet("timeline")]
        [Authorize]
        public async Task<ActionResult<TimelineResponse>> GetTimeline()
        {
            var isAdminClaim = User.FindFirst("isAdmin")?.Value;
            if (!string.Equals(isAdminClaim, "true", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var users = await _context.Users.Select(u => u.CreatedAt).ToListAsync();
            var properties = await _context.Properties.Select(p => new { p.CreatedAt, p.PublishedAt }).ToListAsync();

            var userGroups = users
                .GroupBy(d => DateOnly.FromDateTime(d.Date))
                .Select(g => new { Date = g.Key, Daily = g.Count() })
                .OrderBy(x => x.Date)
                .ToList();

            var propGroups = properties
                .GroupBy(p => DateOnly.FromDateTime(p.CreatedAt.Date))
                .Select(g => new { Date = g.Key, Daily = g.Count() })
                .OrderBy(x => x.Date)
                .ToList();

            var pubGroups = properties
                .Where(p => p.PublishedAt != null)
                .GroupBy(p => DateOnly.FromDateTime(p.PublishedAt!.Value.Date))
                .Select(g => new { Date = g.Key, Daily = g.Count() })
                .OrderBy(x => x.Date)
                .ToList();

            // Build cumulative timelines
            List<TimelinePoint> userTimeline = new();
            int cumulative = 0;
            foreach (var g in userGroups)
            {
                cumulative += g.Daily;
                userTimeline.Add(new TimelinePoint(g.Date, cumulative));
            }

            List<TimelinePoint> propTimeline = new();
            cumulative = 0;
            foreach (var g in propGroups)
            {
                cumulative += g.Daily;
                propTimeline.Add(new TimelinePoint(g.Date, cumulative));
            }

            List<TimelinePoint> publishedTimeline = new();
            cumulative = 0;
            foreach (var g in pubGroups)
            {
                cumulative += g.Daily;
                publishedTimeline.Add(new TimelinePoint(g.Date, cumulative));
            }

            var response = new TimelineResponse(userTimeline, propTimeline, publishedTimeline);
            return Ok(response);
        }
    }
}
