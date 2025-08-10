using Back_end.Models;
using Back_end.Data;
using Microsoft.EntityFrameworkCore;

namespace Back_end.Persistence
{
    public class PropertyRepository
    {
        private readonly ApplicationDbContext _context;

        public PropertyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            return await _context.Properties
                .Include(p => p.Images)
                .ToListAsync();
        }

        public async Task<Property?> GetByIdAsync(Guid id)
        {
            return await _context.Properties
                .Include(p => p.Images)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Property> CreateAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<bool> UpdateAsync(Property property)
        {
            var existing = await _context.Properties.FindAsync(property.Id);
            if (existing == null) return false;

            // Mettre à jour uniquement les propriétés modifiables
            existing.Surface = property.Surface;
            existing.Address = property.Address;
            existing.Status = property.Status;
            existing.PublishedAt = property.PublishedAt;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return false;
            
            _context.Properties.Remove(property);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
