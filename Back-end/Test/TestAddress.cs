using Xunit;
using Back_end.Models;

namespace Back_end.Test
{
    public class TestAddress
    {
        [Fact]
        public void Address_ShouldCreateWithDefaultValues()
        {
            // Arrange & Act
            var address = new Address();

            // Assert
            Assert.NotNull(address);
            Assert.Equal(string.Empty, address.Street);
            Assert.Equal(string.Empty, address.City);
            Assert.Equal(string.Empty, address.ZipCode);
        }

        [Fact]
        public void Address_ShouldAllowPropertyAssignment()
        {
            // Arrange
            var address = new Address();
            var street = "123 Main Street";
            var city = "Paris";
            var zipCode = "75001";

            // Act
            address.Street = street;
            address.City = city;
            address.ZipCode = zipCode;

            // Assert
            Assert.Equal(street, address.Street);
            Assert.Equal(city, address.City);
            Assert.Equal(zipCode, address.ZipCode);
        }

        [Theory]
        [InlineData("123 Rue de la Paix", "Paris", "75001")]
        [InlineData("456 Oxford Street", "London", "W1A0AA")]
        [InlineData("789 Fifth Avenue", "New York", "10022")]
        public void Address_ShouldAcceptVariousFormats(string street, string city, string zipCode)
        {
            // Arrange & Act
            var address = new Address
            {
                Street = street,
                City = city,
                ZipCode = zipCode
            };

            // Assert
            Assert.Equal(street, address.Street);
            Assert.Equal(city, address.City);
            Assert.Equal(zipCode, address.ZipCode);
        }
    }
}
