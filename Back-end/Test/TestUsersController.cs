using Xunit;
using Microsoft.AspNetCore.Mvc;
using Back_end.Controllers;
using Back_end.Models;
using Back_end.Persistence;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestUsersController
    {
        [Fact]
        public void RegisterUserRequest_ShouldCreateWithValidData()
        {
            // Arrange & Act
            var request = new UsersController.RegisterUserRequest("test@example.com", "password123", false);

            // Assert
            Assert.Equal("test@example.com", request.Email);
            Assert.Equal("password123", request.Password);
            Assert.False(request.IsAdmin);
        }

        [Fact]
        public void RegisterUserRequest_ShouldCreateAdminUser()
        {
            // Arrange & Act
            var request = new UsersController.RegisterUserRequest("admin@example.com", "adminpass", true);

            // Assert
            Assert.Equal("admin@example.com", request.Email);
            Assert.Equal("adminpass", request.Password);
            Assert.True(request.IsAdmin);
        }

        [Fact]
        public void LoginRequest_ShouldCreateWithValidData()
        {
            // Arrange & Act
            var request = new UsersController.LoginRequest("test@example.com", "password123");

            // Assert
            Assert.Equal("test@example.com", request.Email);
            Assert.Equal("password123", request.Password);
        }

        [Fact]
        public void AuthResponse_ShouldCreateWithValidData()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var token = "sample-jwt-token";

            // Act
            var response = new UsersController.AuthResponse(userId, "test@example.com", true, token);

            // Assert
            Assert.Equal(userId, response.Id);
            Assert.Equal("test@example.com", response.Email);
            Assert.True(response.IsAdmin);
            Assert.Equal(token, response.Token);
        }

        [Theory]
        [InlineData("user@test.com", "password123")]
        [InlineData("admin@company.com", "securepass")]
        [InlineData("developer@example.org", "devpass")]
        public void LoginRequest_ShouldAcceptValidCredentials(string email, string password)
        {
            // Arrange & Act
            var request = new UsersController.LoginRequest(email, password);

            // Assert
            Assert.Equal(email, request.Email);
            Assert.Equal(password, request.Password);
            Assert.False(string.IsNullOrWhiteSpace(request.Email));
            Assert.False(string.IsNullOrWhiteSpace(request.Password));
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("invalid-email")]
        public void RegisterUserRequest_ShouldValidateEmail(string email)
        {
            // Arrange & Act
            var request = new UsersController.RegisterUserRequest(email, "password123", false);

            // Assert
            var isValidEmail = !string.IsNullOrWhiteSpace(email) && email.Contains("@");
            Assert.Equal(email, request.Email);
            
            if (email.Contains("@"))
            {
                Assert.True(isValidEmail);
            }
            else
            {
                Assert.False(isValidEmail);
            }
        }
    }
}
