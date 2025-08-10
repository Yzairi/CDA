using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Back_end.Models
{
    [Owned]
    public class Address
    {
        [Required]
        [MaxLength(255)]
        public string Street { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(10)]
        public string ZipCode { get; set; } = string.Empty;
    }
}
