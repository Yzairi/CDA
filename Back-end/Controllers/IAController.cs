using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace Back_end.Controllers
{
    /// <summary>
    /// Contrôleur pour les services d'intelligence artificielle (estimation de prix et amélioration de descriptions)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class IAController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        /// <summary>
        /// Initialise une nouvelle instance du contrôleur IA
        /// </summary>
        /// <param name="httpClient">Client HTTP pour les appels API externes</param>
        /// <param name="config">Configuration de l'application</param>
        public IAController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        /// <summary>
        /// Modèle de demande d'estimation de prix
        /// </summary>
        /// <param name="Description">Description détaillée du bien immobilier</param>
        /// <param name="IsForSale">True pour une vente, false pour une location</param>
        public record EstimationRequest(
            string Description,
            bool IsForSale);

        /// <summary>
        /// Modèle de réponse d'estimation de prix
        /// </summary>
        /// <param name="EstimatedPrice">Prix estimé principal</param>
        /// <param name="MinPrice">Prix minimum de la fourchette</param>
        /// <param name="MaxPrice">Prix maximum de la fourchette</param>
        /// <param name="Explanation">Explication détaillée de l'estimation</param>
        public record EstimationResponse(
            decimal EstimatedPrice,
            decimal MinPrice,
            decimal MaxPrice,
            string Explanation);

        /// <summary>
        /// Modèle de demande d'amélioration de description
        /// </summary>
        /// <param name="Description">Description originale à améliorer</param>
        public record DescriptionRequest(string Description);
        
        /// <summary>
        /// Modèle de réponse d'amélioration de description
        /// </summary>
        /// <param name="EnhancedDescription">Description améliorée par l'IA</param>
        public record DescriptionResponse(string EnhancedDescription);

        /// <summary>
        /// Estime le prix d'un bien immobilier en utilisant l'IA (OpenAI GPT)
        /// </summary>
        /// <param name="request">Demande d'estimation contenant la description et le type de transaction</param>
        /// <returns>Estimation de prix avec fourchette et explication</returns>
        /// <response code="200">Estimation générée avec succès</response>
        /// <response code="400">Demande invalide ou clé API manquante</response>
        /// <response code="500">Erreur interne du serveur</response>
        [HttpPost("estimate")]
        public async Task<ActionResult<EstimationResponse>> EstimatePrice(EstimationRequest request)
        {
            try
            {
                Console.WriteLine($"[Estimate] Request: {request.Description} - IsForSale: {request.IsForSale}");

                // Récupérer la clé OpenAI depuis la configuration
                var openAiApiKey = _config["OpenAI:ApiKey"];
                
                if (string.IsNullOrEmpty(openAiApiKey))
                {
                    return BadRequest("Clé API OpenAI non configurée. Veuillez ajouter votre clé dans appsettings.json");
                }

                var transactionType = request.IsForSale ? "vente" : "location";
                var prompt = request.IsForSale ? 
                $@"CALCULATEUR VENTE 2025

Vous êtes un expert en évaluation immobilière française. Analysez cette description et fournissez une estimation précise pour une VENTE en 2025.

DESCRIPTION: {request.Description}

Utilisez ces références de prix 2025 par région française :
- Paris centre: 12 000-15 000€/m²
- Paris périphérie: 10 000-12 000€/m²
- Lyon centre: 6 000-7 000€/m²
- Marseille centre: 3 500-5 500€/m²
- Toulouse: 3 200-4 800€/m²
- Bordeaux: 5 000-6 000€/m²
- Lille: 3 800-4 200€/m²
- Montpellier: 3 500-5 000€/m²
- Strasbourg: 2 500-3 800€/m²
- Rennes: 3 000-4 500€/m²
- Banlieues grandes villes: -20% à -40%
- Villes moyennes: 1 500-2 500€/m²
- Rural: 100-1 500€/m²

CRITÈRES D'AJUSTEMENT:
✓ État (neuf/rénové/ancien): ±15%
✓ Étage/ascenseur: ±10%
✓ Exposition/luminosité: ±8%
✓ Balcon/terrasse: +5-15%
✓ Parking/garage: +10-25k€
✓ Jardin: +10-30%
✓ Transports en commun: ±10%

Répondez UNIQUEMENT avec ce JSON exact:
{{""EstimatedPrice"": 000000, ""MinPrice"": 000000, ""MaxPrice"": 000000, ""Explanation"": ""Prix basé sur: [LOCALISATION] à [PRIX/M²]€/m² pour [SURFACE]m². Ajustements: [DÉTAILS]. Fourchette: [MIN]-[MAX]€.""}}"
                : 
                $@"CALCULATEUR LOCATION 2025

Vous êtes un expert en évaluation immobilière française. Analysez cette description et fournissez une estimation précise pour une LOCATION MENSUELLE en 2025.

DESCRIPTION: {request.Description}

Utilisez ces références de loyers 2025 par région française (€/m²/mois):
- Paris centre: 40-45€/m²/mois
- Paris périphérie: 29-35€/m²/mois  
- Lyon centre: 15-20€/m²/mois
- Marseille centre: 12-16€/m²/mois
- Toulouse: 12-15€/m²/mois
- Bordeaux: 15-17€/m²/mois
- Lille: 11-14€/m²/mois
- Montpellier: 12-15€/m²/mois
- Strasbourg: 10-13€/m²/mois
- Rennes: 11-14€/m²/mois
- Banlieues grandes villes: -20% à -30%
- Villes moyennes: 8-12€/m²/mois
- Rural: 6-9€/m²/mois

CRITÈRES D'AJUSTEMENT:
✓ État (neuf/rénové/ancien): ±15%
✓ Étage/ascenseur: ±10%
✓ Exposition/luminosité: ±8%
✓ Balcon/terrasse: +50-150€/mois
✓ Parking/garage: +50-200€/mois
✓ Jardin: +100-300€/mois
✓ Transports en commun: ±10%
✓ Meublé: +20-30%

Répondez UNIQUEMENT avec ce JSON exact:
{{""EstimatedPrice"": 0000, ""MinPrice"": 0000, ""MaxPrice"": 0000, ""Explanation"": ""Loyer basé sur: [LOCALISATION] à [PRIX/M²]€/m²/mois pour [SURFACE]m². Ajustements: [DÉTAILS]. Fourchette: [MIN]-[MAX]€/mois.""}}"
                ;

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 500,
                    temperature = 0.1
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[OpenAI Response] Status: {response.StatusCode}");
                Console.WriteLine($"[OpenAI Response] Content: {responseContent}");

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, $"Erreur OpenAI: {responseContent}");
                }

                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var assistantMessage = apiResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                Console.WriteLine($"[Assistant Message] {assistantMessage}");

                // Parser la réponse JSON de l'assistant
                if (string.IsNullOrWhiteSpace(assistantMessage))
                {
                    return BadRequest("Réponse vide de l'API OpenAI");
                }
                
                var estimationResult = JsonSerializer.Deserialize<EstimationResponse>(assistantMessage);

                return Ok(estimationResult);
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"[JSON Error] {ex.Message}");
                
                // Retourner une estimation par défaut en cas d'erreur de parsing
                var fallbackEstimation = new EstimationResponse(
                    EstimatedPrice: request.IsForSale ? 250000 : 1200,
                    MinPrice: request.IsForSale ? 200000 : 1000,
                    MaxPrice: request.IsForSale ? 300000 : 1400,
                    Explanation: "Estimation par défaut - Erreur de parsing de la réponse IA"
                );

                return Ok(fallbackEstimation);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] {ex.Message}");
                return StatusCode(500, $"Erreur interne: {ex.Message}");
            }
        }

        /// <summary>
        /// Améliore une description immobilière en utilisant l'IA (OpenAI GPT)
        /// </summary>
        /// <param name="request">Demande contenant la description originale à améliorer</param>
        /// <returns>Description améliorée et plus attractive</returns>
        /// <response code="200">Description améliorée avec succès</response>
        /// <response code="400">Demande invalide ou clé API manquante</response>
        /// <response code="500">Erreur interne du serveur</response>
        [HttpPost("enhance-description")]
        public async Task<ActionResult<DescriptionResponse>> EnhanceDescription(DescriptionRequest request)
        {
            try
            {
                Console.WriteLine($"[Enhance] Request: {request.Description}");

                // Récupérer la clé OpenAI depuis la configuration
                var openAiApiKey = _config["OpenAI:ApiKey"];
                
                if (string.IsNullOrEmpty(openAiApiKey))
                {
                    return BadRequest("Clé API OpenAI non configurée. Veuillez ajouter votre clé dans appsettings.json");
                }

                var prompt = $@"AMÉLIORATION DE DESCRIPTION IMMOBILIÈRE

Vous êtes un rédacteur immobilier expert. Améliorez cette description pour la rendre plus attractive et professionnelle.

DESCRIPTION ORIGINALE: {request.Description}

RÈGLES:
- Gardez les informations factuelles (surface, localisation, etc.)
- Ajoutez du vocabulaire immobilier valorisant
- Structurez en paragraphes courts
- Mettez en avant les points forts
- Restez factuel, pas de fausses promesses
- Maximum 200 mots
- Ton professionnel mais chaleureux

Répondez UNIQUEMENT avec la description améliorée, sans guillemets ni formatage JSON.";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 300,
                    temperature = 0.3
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"[OpenAI Response] Status: {response.StatusCode}");
                Console.WriteLine($"[OpenAI Response] Content: {responseContent}");

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, $"Erreur OpenAI: {responseContent}");
                }

                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var enhancedDescription = apiResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                Console.WriteLine($"[Enhanced Description] {enhancedDescription}");

                if (string.IsNullOrWhiteSpace(enhancedDescription))
                {
                    return BadRequest("Réponse vide de l'API OpenAI");
                }

                var result = new DescriptionResponse(enhancedDescription);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] {ex.Message}");
                return StatusCode(500, $"Erreur interne: {ex.Message}");
            }
        }
    }
}
