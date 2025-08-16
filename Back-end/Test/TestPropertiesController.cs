using Xunit;
using Microsoft.AspNetCore.Mvc;
using Back_end.Controllers;
using Back_end.Models;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestPropertiesController
    {
        [Fact]
        public void CreatePropertyRequest_ShouldCreateWithValidData()
        {
            // Arrange
            var address = new Address
            {
                Street = "123 Main Street",
                City = "Paris",
                ZipCode = "75001"
            };

            // Act
            var request = new PropertiesController.CreatePropertyRequest(
                "Beautiful House",
                "A lovely family home",
                "House",
                250000.50m,
                120.75m,
                address
            );

            // Assert
            Assert.Equal("Beautiful House", request.Title);
            Assert.Equal("A lovely family home", request.Description);
            Assert.Equal("House", request.Type);
            Assert.Equal(250000.50m, request.Price);
            Assert.Equal(120.75m, request.Surface);
            Assert.Equal(address, request.Address);
        }

        [Theory]
        [InlineData("Apartment", 150000.00)]
        [InlineData("Villa", 500000.99)]
        [InlineData("Studio", 75000.50)]
        public void CreatePropertyRequest_ShouldAcceptDifferentTypes(string type, decimal price)
        {
            // Arrange
            var address = new Address { Street = "Test", City = "Test", ZipCode = "12345" };

            // Act
            var request = new PropertiesController.CreatePropertyRequest(
                "Test Property",
                "Test Description",
                type,
                price,
                100.0m,
                address
            );

            // Assert
            Assert.Equal(type, request.Type);
            Assert.Equal(price, request.Price);
        }

        [Fact]
        public void CreatePropertyRequest_ShouldValidateRequiredFields()
        {
            // Arrange
            var address = new Address { Street = "Test", City = "Test", ZipCode = "12345" };

            // Act
            var request = new PropertiesController.CreatePropertyRequest(
                "Test Title",
                "Test Description",
                "House",
                100000m,
                50.0m,
                address
            );

            // Assert
            Assert.False(string.IsNullOrEmpty(request.Title));
            Assert.False(string.IsNullOrEmpty(request.Description));
            Assert.False(string.IsNullOrEmpty(request.Type));
            Assert.True(request.Price > 0);
            Assert.True(request.Surface > 0);
            Assert.NotNull(request.Address);
        }
    }
}
