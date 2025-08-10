using Microsoft.AspNetCore.Mvc;
using Back_end.Models;
using Back_end.Persistence;
using Back_end.Enums;

namespace Back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly PropertyRepository _repository;

        public PropertiesController(PropertyRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Property>>> GetAll()
        {
            var properties = await _repository.GetAllAsync();
            return Ok(properties);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Property>> GetById(Guid id)
        {
            var property = await _repository.GetByIdAsync(id);
            if (property == null)
                return NotFound();

            return Ok(property);
        }

        public record CreatePropertyRequest(
            string Title,
            string Description,
            string Type,
            decimal Price,
            decimal Surface,
            Address Address,
            Guid UserId);

        [HttpPost]
        public async Task<ActionResult<Property>> Create(CreatePropertyRequest request)
        {
            var property = new Property(
                title: request.Title,
                description: request.Description,
                type: request.Type,
                price: request.Price)
            {
                Surface = request.Surface,
                Address = request.Address,
                UserId = request.UserId
            };

            var created = await _repository.CreateAsync(property);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        public record UpdatePropertyRequest(
            string Title,
            string Description,
            string Type,
            decimal Price,
            decimal Surface,
            Address Address);

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

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
    }
}
