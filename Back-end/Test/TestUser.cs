using Xunit;
using Back_end.Models;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestUser
    {
        [Fact]
        public void User_ShouldCreateWithRequiredParameters()
        {
            // Arrange & Act
            var user = new User("test@example.com", "hashedpassword");

            // Assert
            Assert.Equal("test@example.com", user.Email);
            Assert.Equal("hashedpassword", user.PasswordHash);
            Assert.NotEqual(Guid.Empty, user.Id);
            Assert.Equal(UserRole.ADVERTISER, user.Role);
            Assert.Equal(UserStatus.ACTIVE, user.Status);
            Assert.True(user.CreatedAt <= DateTime.UtcNow);
        }

        [Fact]
        public void User_ShouldAllowRoleChange()
        {
            // Arrange
            var user = new User("test@example.com", "hashedpassword");

            // Act
            user.Role = UserRole.ADMIN;

            // Assert
            Assert.Equal(UserRole.ADMIN, user.Role);
        }

        [Fact]
        public void User_ShouldAllowStatusChange()
        {
            // Arrange
            var user = new User("test@example.com", "hashedpassword");

            // Act
            user.Status = UserStatus.SUSPENDED;

            // Assert
            Assert.Equal(UserStatus.SUSPENDED, user.Status);
        }

        [Fact]
        public void User_ShouldHaveEmptyPropertiesCollection()
        {
            // Arrange & Act
            var user = new User("test@example.com", "hashedpassword");

            // Assert
            Assert.NotNull(user.Properties);
            Assert.Empty(user.Properties);
        }

        [Theory]
        [InlineData("user@test.com")]
        [InlineData("admin@company.com")]
        [InlineData("developer@example.org")]
        public void User_ShouldAcceptValidEmails(string email)
        {
            // Arrange & Act
            var user = new User(email, "password");

            // Assert
            Assert.Equal(email, user.Email);
        }
    }
}
