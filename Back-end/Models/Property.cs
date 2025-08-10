using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Back_end.Enums;

namespace Back_end.Models
{
    public class Property(string title, string description, string type, decimal price)
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();
        
        [Required, MaxLength(120)]
        public string Title { get; set; } = title;
        
        [Required]
        public string Description { get; set; } = description;
        
        [Required, MaxLength(50)]
        public string Type { get; set; } = type;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; } = price;
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Surface { get; set; }
        
        public Address Address { get; set; } = new();
        
        [Required]
        public Guid UserId { get; init; }
        
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

        public PropertyStatus Status { get; set; } = PropertyStatus.DRAFT;

        public DateTime? PublishedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public ICollection<Image> Images { get; set; } = new List<Image>();
    }
}
