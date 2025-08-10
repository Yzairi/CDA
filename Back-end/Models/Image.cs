using System.ComponentModel.DataAnnotations;

namespace Back_end.Models
{
    public class Image(string url)
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();
        
        [Required]
        public string Url { get; init; } = url;
        
        public int Order { get; set; }
        
        [Required]
        public Guid PropertyId { get; init; }

        // Navigation property
        public Property? Property { get; set; }
    }
}
