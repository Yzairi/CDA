using System.ComponentModel.DataAnnotations;
using Back_end.Enums;

namespace Back_end.Models
{
    public class User(string email, string passwordHash)
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; init; } = email;

        [Required, MaxLength(255)]
        public string PasswordHash { get; init; } = passwordHash;

        [Required]
        public UserRole Role { get; set; } = UserRole.ADVERTISER;

        [Required]
        public UserStatus Status { get; set; } = UserStatus.ACTIVE;

        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;


        // Navigation property
        public ICollection<Property> Properties { get; set; } = new List<Property>();
    }
}
