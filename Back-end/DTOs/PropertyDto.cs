using Back_end.Models;

namespace Back_end.DTOs
{
    public class PropertyDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Surface { get; set; }
        public Address Address { get; set; } = new();
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public List<Image> Images { get; set; } = new();
        public UserDto? User { get; set; }
    }

    public class UserDto
    {
        public string Email { get; set; } = string.Empty;
    }
}
