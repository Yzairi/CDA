using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace Back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PriceEstimationController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public PriceEstimationController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public record EstimationRequest(
            string Description,
            bool IsForSale); // true = vente, false = location

        public record EstimationResponse(
            decimal EstimatedPrice,
            decimal MinPrice,
            decimal MaxPrice,
            string Explanation);

        public record DescriptionRequest(string Description);
        public record DescriptionResponse(string EnhancedDescription);

        [HttpPost("estimate")]
        public async Task<ActionResult<EstimationResponse>> EstimatePrice(EstimationRequest request)
        {
            try
            {
                Console.WriteLine($"[Estimate] Request: {request.Description} - IsForSale: {request.IsForSale}");

                // Clé OpenAI
                var openAiApiKey = "xxxxxxxxxxxxxxxxxxxxxxx";

                var transactionType = request.IsForSale ? "vente" : "location";
                var prompt = request.IsForSale ? 
                $@"CALCULATEUR VENTE 2025

PRIX €/m² :
Paris 15ème: 12800 | Paris 1er: 16500 | Lyon: 6800 | Bordeaux: 5800

Bien: {request.Description}

CALCUL:
1. Trouve la ville → prix €/m²
2. Prix de base = prix €/m² × surface
3. Ajustements: bon état +8%, balcon +5%, métro +5%
4. Total = prix de base × (1 + ajustements)

JSON:
{{
  ""estimatedPrice"": [PRIX_TOTAL],
  ""minPrice"": [TOTAL × 0.9],
  ""maxPrice"": [TOTAL × 1.1],
  ""explanation"": ""[VILLE] [PRIX]€/m² × [SURFACE]m² = [BASE]€. +[%] = [TOTAL]€""
}}" :
                $@"CALCULATEUR LOCATION 2025 - LOYER MENSUEL

PRIX €/m² :
Paris 15ème: 12800 | Paris 1er: 16500 | Lyon: 6800 | Bordeaux: 5800

Bien: {request.Description}

CALCUL LOYER MENSUEL:
1. Trouve la ville → prix €/m²
2. Prix vente = prix €/m² × surface
3. Ajustements: bon état +8%, balcon +5%, métro +5%
4. Prix ajusté = prix vente × (1 + ajustements)
5. LOYER MENSUEL = prix ajusté ÷ 280

EXEMPLE Paris 15ème 75m²:
- 12800 × 75 = 960000€
- +18% = 1132800€
- LOYER = 1132800 ÷ 280 = 4046€/mois

JSON (valeurs en €/mois):
{{
  ""estimatedPrice"": [LOYER_MENSUEL],
  ""minPrice"": [LOYER × 0.9],
  ""maxPrice"": [LOYER × 1.1],
  ""explanation"": ""[VILLE] [PRIX]€/m² × [SURFACE]m² = [BASE]€. +[%] = [AJUSTÉ]€. Loyer: [AJUSTÉ]÷280 = [LOYER]€/mois""
}}";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[] { new { role = "user", content = prompt } },
                    max_tokens = 500,
                    temperature = 0.3
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[Estimate] OpenAI error: {response.StatusCode} - {errorContent}");
                    return BadRequest($"Erreur OpenAI: {response.StatusCode} - {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var openAiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

                var aiContent = openAiResponse
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(aiContent))
                {
                    return BadRequest("Réponse vide de l'API OpenAI");
                }

                // Parser la réponse JSON de l'IA
                JsonElement estimationData;
                try
                {
                    estimationData = JsonSerializer.Deserialize<JsonElement>(aiContent);
                }
                catch (Exception parseEx)
                {
                    Console.WriteLine($"[Estimate] Erreur parse: {parseEx.Message} | content: {aiContent}");
                    return BadRequest($"Impossible de parser la réponse IA: {parseEx.Message}");
                }

                var estimation = new EstimationResponse(
                    EstimatedPrice: estimationData.GetProperty("estimatedPrice").GetDecimal(),
                    MinPrice: estimationData.GetProperty("minPrice").GetDecimal(),
                    MaxPrice: estimationData.GetProperty("maxPrice").GetDecimal(),
                    Explanation: estimationData.GetProperty("explanation").GetString() ?? string.Empty
                );

                return Ok(estimation);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Estimate] Exception: {ex}");
                return BadRequest($"Erreur estimation: {ex.Message}");
            }
        }

        [HttpPost("enhance-description")]
        public async Task<ActionResult<DescriptionResponse>> EnhanceDescription(DescriptionRequest request)
        {
            try
            {
                Console.WriteLine($"[EnhanceDescription] Request: {request.Description}");

                // Clé OpenAI
                var openAiApiKey = "xxxxxxxxxxx";

                var prompt = $@"Tu es un expert en rédaction d'annonces immobilières. 

MISSION: Transforme cette description basique en description attractive et professionnelle.

Description originale: {request.Description}

RÈGLES:
- Garde TOUTES les informations factuelles (surface, nombre de pièces, localisation, etc.)
- Ajoute du vocabulaire immobilier professionnel et attractif
- Utilise des mots évocateurs et positifs
- Structure le texte de manière fluide et vendeuse
- Reste factuel, n'invente pas d'éléments qui ne sont pas mentionnés
- Maximum 150 mots

STYLE SOUHAITÉ:
- Élégant et professionnel
- Attractif pour les acheteurs/locataires
- Vocabulaire immobilier approprié
- Mise en valeur des atouts

Retourne UNIQUEMENT la description améliorée (pas de JSON, juste le texte).";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[] { new { role = "user", content = prompt } },
                    max_tokens = 300,
                    temperature = 0.7
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[EnhanceDescription] OpenAI error: {response.StatusCode} - {errorContent}");
                    return BadRequest($"Erreur OpenAI: {response.StatusCode} - {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var openAiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

                var enhancedDescription = openAiResponse
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(enhancedDescription))
                {
                    return BadRequest("Réponse vide de l'API OpenAI");
                }

                // Nettoyer la réponse (enlever les guillemets éventuels)
                enhancedDescription = enhancedDescription.Trim().Trim('"');

                var result = new DescriptionResponse(enhancedDescription);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EnhanceDescription] Exception: {ex}");
                return BadRequest($"Erreur amélioration description: {ex.Message}");
            }
        }
    }
}
