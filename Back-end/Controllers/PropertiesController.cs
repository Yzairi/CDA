using Microsoft.AspNetCore.Mvc;
using Back_end.Models;
using Back_end.Persistence;
using Back_end.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Amazon.S3;
using Amazon.S3.Model;
using Back_end.Data;

namespace Back_end.Controllers
{
    /// <summary>
    /// Contrôleur pour la gestion des propriétés immobilières
    /// Gère la création, modification, suppression et consultation des annonces immobilières
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly PropertyRepository _repository;
        private readonly IAmazonS3 _s3;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _db;

        public PropertiesController(PropertyRepository repository, IAmazonS3 s3, IConfiguration config, ApplicationDbContext db)
        {
            _repository = repository;
            _s3 = s3;
            _config = config;
            _db = db;
        }

        /// <summary>
        /// Récupère toutes les propriétés
        /// </summary>
        /// <returns>Liste de toutes les propriétés avec leurs informations complètes</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Property>>> GetAll()
        {
            var properties = await _repository.GetAllAsync();
            return Ok(properties);
        }

        /// <summary>
        /// Modèle de requête pour créer une nouvelle propriété
        /// </summary>
        /// <param name="Title">Titre de l'annonce</param>
        /// <param name="Description">Description détaillée de la propriété</param>
        /// <param name="Type">Type de propriété (Appartement, Maison, etc.)</param>
        /// <param name="Price">Prix de vente ou de location</param>
        /// <param name="Surface">Surface en m²</param>
        /// <param name="Address">Adresse complète de la propriété</param>
        public record CreatePropertyRequest(
            string Title,
            string Description,
            string Type,
            decimal Price,
            decimal Surface,
            Address Address);

        /// <summary>
        /// Crée une nouvelle propriété
        /// Nécessite une authentification
        /// </summary>
        /// <param name="request">Requête de création contenant les informations de la propriété</param>
        /// <returns>Propriété créée avec son ID unique</returns>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Property>> Create(CreatePropertyRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }
            var property = new Property(
                title: request.Title,
                description: request.Description,
                type: request.Type,
                price: request.Price)
            {
                Surface = request.Surface,
                Address = request.Address,
                UserId = userId
            };

            var created = await _repository.CreateAsync(property);
            return Created($"/api/Properties/{created.Id}", created);
        }

        /// <summary>
        /// Modèle de requête pour mettre à jour une propriété existante
        /// </summary>
        /// <param name="Title">Titre de l'annonce</param>
        /// <param name="Description">Description détaillée de la propriété</param>
        /// <param name="Type">Type de propriété (Appartement, Maison, etc.)</param>
        /// <param name="Price">Prix de vente ou de location</param>
        /// <param name="Surface">Surface en m²</param>
        /// <param name="Address">Adresse complète de la propriété</param>
        public record UpdatePropertyRequest(
            string Title,
            string Description,
            string Type,
            decimal Price,
            decimal Surface,
            Address Address);

        /// <summary>
        /// Met à jour une propriété existante
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété à mettre à jour</param>
        /// <param name="request">Requête de mise à jour contenant les nouvelles informations de la propriété</param>
        /// <returns>Résultat de l'opération de mise à jour</returns>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdatePropertyRequest request)
        {
            var property = await _repository.GetByIdAsync(id);
            if (property == null)
                return NotFound();

            property.Title = request.Title;
            property.Description = request.Description;
            property.Type = request.Type;
            property.Price = request.Price;
            property.Surface = request.Surface;
            property.Address = request.Address;

            var success = await _repository.UpdateAsync(property);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Supprime une propriété existante
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété à supprimer</param>
        /// <returns>Résultat de l'opération de suppression</returns>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Publie une propriété (la rend visible dans les résultats de recherche)
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété à publier</param>
        /// <returns>Résultat de l'opération de publication</returns>
        [Authorize]
        [HttpPost("{id}/publish")]
        public async Task<IActionResult> Publish(Guid id)
        {
            var property = await _repository.GetByIdAsync(id);
            if (property == null)
                return NotFound();

            property.Status = PropertyStatus.PUBLISHED;
            property.PublishedAt = DateTime.UtcNow;
            
            await _repository.UpdateAsync(property);
            return NoContent();
        }

        /// <summary>
        /// Archive une propriété (la rend invisible dans les résultats de recherche)
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété à archiver</param>
        /// <returns>Résultat de l'opération d'archivage</returns>
        [Authorize]
        [HttpPost("{id}/archive")]
        public async Task<IActionResult> Archive(Guid id)
        {
            var property = await _repository.GetByIdAsync(id);
            if (property == null)
                return NotFound();

            property.Status = PropertyStatus.ARCHIVED;
            
            await _repository.UpdateAsync(property);
            return NoContent();
        }

        /// <summary>
        /// Met une propriété en statut "brouillon"
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété à modifier</param>
        /// <returns>Résultat de l'opération de modification</returns>
        [Authorize]
        [HttpPost("{id}/draft")]
        public async Task<IActionResult> Draft(Guid id)
        {
            var property = await _repository.GetByIdAsync(id);
            if (property == null)
                return NotFound();

            property.Status = PropertyStatus.DRAFT;
            await _repository.UpdateAsync(property);
            return NoContent();
        }

        // SIMPLE: upload 1 image -> now persisted in DB
        /// <summary>
        /// Télécharge une image pour une propriété
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété</param>
        /// <param name="file">Fichier image à télécharger</param>
        /// <param name="ct">Token d'annulation</param>
        /// <returns>URL de l'image téléchargée</returns>
        [Authorize]
        [HttpPost("{id}/image-simple")]
        public async Task<ActionResult<string>> UploadSingle(Guid id, IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0) return BadRequest("file required");
            var property = await _repository.GetByIdAsync(id);
            if (property == null) return NotFound("property");

            var bucket = _config["S3:Bucket"];
            if (string.IsNullOrWhiteSpace(bucket)) return BadRequest("S3 bucket not configured");
            var safeName = Path.GetFileName(file.FileName);
            var key = $"tmp/{Guid.NewGuid()}_{safeName}"; // later: properties/{id}/...

            using var stream = file.OpenReadStream();
            var put = new PutObjectRequest
            {
                BucketName = bucket,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };
            await _s3.PutObjectAsync(put, ct);
            var region = _config["S3:Region"] ?? "eu-west-3";
            var url = $"https://{bucket}.s3.{region}.amazonaws.com/{key}";

            // Persist image
            var order = property.Images.Any() ? property.Images.Max(i => i.Order) + 1 : 0;
            var image = new Image(url)
            {
                PropertyId = id,
                Order = order
            };
            _db.Images.Add(image);
            await _db.SaveChangesAsync(ct);
            return Ok(url);
        }

        // MULTI upload endpoint returning list of image metadata
        /// <summary>
        /// Télécharge plusieurs images pour une propriété
        /// Nécessite une authentification
        /// </summary>
        /// <param name="id">ID de la propriété</param>
        /// <param name="files">Liste des fichiers image à télécharger</param>
        /// <param name="ct">Token d'annulation</param>
        /// <returns>Liste des métadonnées des images téléchargées</returns>
        public record ImageDto(Guid Id, string Url, int Order);

        [Authorize]
        [HttpPost("{id}/images")]
        public async Task<ActionResult<IEnumerable<ImageDto>>> UploadMany(Guid id, List<IFormFile> files, CancellationToken ct)
        {
            if (files == null || files.Count == 0) return BadRequest("files required");
            var property = await _repository.GetByIdAsync(id);
            if (property == null) return NotFound("property");

            var bucket = _config["S3:Bucket"];
            if (string.IsNullOrWhiteSpace(bucket)) return BadRequest("S3 bucket not configured");
            var region = _config["S3:Region"] ?? "eu-west-3";
            int order = property.Images.Any() ? property.Images.Max(i => i.Order) + 1 : 0;
            var result = new List<ImageDto>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;
                var safeName = Path.GetFileName(file.FileName);
                var key = $"properties/{id}/{Guid.NewGuid()}_{safeName}";
                using var stream = file.OpenReadStream();
                var put = new PutObjectRequest
                {
                    BucketName = bucket,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType
                };
                await _s3.PutObjectAsync(put, ct);
                var url = $"https://{bucket}.s3.{region}.amazonaws.com/{key}";
                var image = new Image(url)
                {
                    PropertyId = id,
                    Order = order++
                };
                _db.Images.Add(image);
                result.Add(new ImageDto(image.Id, image.Url, image.Order));
            }
            await _db.SaveChangesAsync(ct);
            return Ok(result.OrderBy(r => r.Order));
        }

        // DELETE single image
        /// <summary>
        /// Supprime une image d'une propriété
        /// Nécessite une authentification
        /// </summary>
        /// <param name="propertyId">ID de la propriété</param>
        /// <param name="imageId">ID de l'image à supprimer</param>
        /// <param name="ct">Token d'annulation</param>
        /// <returns>Résultat de l'opération de suppression</returns>
        [Authorize]
        [HttpDelete("{propertyId}/images/{imageId}")]
        public async Task<IActionResult> DeleteImage(Guid propertyId, Guid imageId, CancellationToken ct)
        {
            var property = await _repository.GetByIdAsync(propertyId);
            if (property == null) return NotFound("property");
            var image = property.Images.FirstOrDefault(i => i.Id == imageId);
            if (image == null) return NotFound("image");

            _db.Images.Remove(image);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        public record ReorderRequest(List<Guid> ImageIds);

        /// <summary>
        /// Modifie l'ordre des images d'une propriété
        /// Nécessite une authentification
        /// </summary>
        /// <param name="propertyId">ID de la propriété</param>
        /// <param name="body">Requête contenant la nouvelle liste d'IDs d'images dans l'ordre souhaité</param>
        /// <param name="ct">Token d'annulation</param>
        /// <returns>Résultat de l'opération de modification d'ordre</returns>
        [Authorize]
        [HttpPut("{propertyId}/images/reorder")]
        public async Task<IActionResult> ReorderImages(Guid propertyId, [FromBody] ReorderRequest body, CancellationToken ct)
        {
            if (body.ImageIds == null || body.ImageIds.Count == 0) return BadRequest("imageIds required");
            var property = await _repository.GetByIdAsync(propertyId);
            if (property == null) return NotFound("property");

            // Ensure all ids belong to property
            var images = property.Images.OrderBy(i => i.Order).ToList();
            if (images.Select(i => i.Id).Except(body.ImageIds).Any() || body.ImageIds.Except(images.Select(i => i.Id)).Any())
            {
                return BadRequest("imageIds mismatch");
            }
            // Apply new order
            var orderMap = body.ImageIds.Select((id, idx) => new { id, idx }).ToDictionary(x => x.id, x => x.idx);
            foreach (var img in images)
            {
                img.Order = orderMap[img.Id];
            }
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }
    }
}
