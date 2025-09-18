using Xunit;
using Back_end.Models;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestProperty
    {
        [Fact]
        public void Property_ShouldCreateWithRequiredParameters()
        {
            // Arrange & Act
            var property = new Property("Beautiful House", "A lovely family home", "House", 250000.50m);

            // Assert
            Assert.Equal("Beautiful House", property.Title);
            Assert.Equal("A lovely family home", property.Description);
            Assert.Equal("House", property.Type);
            Assert.Equal(250000.50m, property.Price);
            Assert.NotEqual(Guid.Empty, property.Id);
            Assert.Equal(PropertyStatus.PUBLISHED, property.Status);
            Assert.True(property.CreatedAt <= DateTime.UtcNow);
        }

        [Fact]
        public void Property_ShouldAllowSurfaceUpdate()
        {
            // Arrange
            var property = new Property("Test", "Test desc", "House", 100000m);

            // Act
            property.Surface = 150.75m;

            // Assert
            Assert.Equal(150.75m, property.Surface);
        }

        [Fact]
        public void Property_ShouldAllowStatusChange()
        {
            // Arrange
            var property = new Property("Test", "Test desc", "House", 100000m);

            // Act
            property.Status = PropertyStatus.PUBLISHED;

            // Assert
            Assert.Equal(PropertyStatus.PUBLISHED, property.Status);
        }

        [Fact]
        public void Property_ShouldHaveDefaultAddress()
        {
            // Arrange & Act
            var property = new Property("Test", "Test desc", "House", 100000m);

            // Assert
            Assert.NotNull(property.Address);
        }

        [Fact]
        public void Property_ShouldHaveEmptyImagesCollection()
        {
            // Arrange & Act
            var property = new Property("Test", "Test desc", "House", 100000m);

            // Assert
            Assert.NotNull(property.Images);
            Assert.Empty(property.Images);
        }

        [Theory]
        [InlineData("Apartment", 150000.00)]
        [InlineData("Villa", 500000.99)]
        [InlineData("Studio", 75000.50)]
        public void Property_ShouldAcceptDifferentTypesAndPrices(string type, decimal price)
        {
            // Arrange & Act
            var property = new Property("Test Property", "Description", type, price);

            // Assert
            Assert.Equal(type, property.Type);
            Assert.Equal(price, property.Price);
        }

        [Fact]
        public void Property_ShouldAllowPublishedAtUpdate()
        {
            // Arrange
            var property = new Property("Test", "Test desc", "House", 100000m);
            var publishedDate = DateTime.UtcNow;

            // Act
            property.PublishedAt = publishedDate;

            // Assert
            Assert.Equal(publishedDate, property.PublishedAt);
        }
    }
}
