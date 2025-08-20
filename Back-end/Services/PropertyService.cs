using Back_end.Services.Interfaces;
using Back_end.Persistence;
using Back_end.Models;
using Back_end.DTOs;

namespace Back_end.Services
{
    /// <summary>
    /// Implémentation du service de gestion des propriétés
    /// </summary>
    public class PropertyService : IPropertyService
    {
        private readonly PropertyRepository _propertyRepository;
        private readonly ILogger<PropertyService> _logger;

        public PropertyService(PropertyRepository propertyRepository, ILogger<PropertyService> logger)
        {
            _propertyRepository = propertyRepository;
            _logger = logger;
        }

        // TODO: Déplacer ici toute la logique métier depuis PropertiesController
        // - Validation des données d'entrée
        // - Transformation des modèles
        // - Règles métier spécifiques
        // - Gestion des erreurs métier
    }
}
