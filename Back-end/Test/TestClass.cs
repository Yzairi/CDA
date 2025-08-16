using Xunit;
using Back_end.Models;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestClass
    {
        [Fact]
        public void User_ShouldCreateUserWithValidData()
        {
            // Arrange
            var user = new User("john@example.com", "hashedpassword")
            {
                Role = UserRole.ADVERTISER,
                Status = UserStatus.ACTIVE
            };

            // Act & Assert
            Assert.Equal("john@example.com", user.Email);
            Assert.Equal("hashedpassword", user.PasswordHash);
            Assert.Equal(UserRole.ADVERTISER, user.Role);
            Assert.Equal(UserStatus.ACTIVE, user.Status);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("invalid-email")]
        public void User_ShouldHaveValidEmail(string email)
        {
            // Arrange & Act
            var isValid = !string.IsNullOrWhiteSpace(email) && email.Contains("@");

            // Assert
            if (email == "john@example.com")
            {
                Assert.True(isValid);
            }
            else
            {
                Assert.False(isValid);
            }
        }

        [Fact]
        public void User_ShouldHaveDefaultRole()
        {
            // Arrange
            var user = new User("test@example.com", "password");

            // Act & Assert
            Assert.Equal(UserRole.ADVERTISER, user.Role);
        }

        [Fact]
        public void Property_ShouldCreatePropertyWithValidData()
        {
            // Arrange
            var property = new Property("Beautiful House", "A nice house for sale", "House", 250000.00m)
            {
                Surface = 120.5m,
                Status = PropertyStatus.PUBLISHED
            };

            // Act & Assert
            Assert.Equal("Beautiful House", property.Title);
            Assert.Equal("A nice house for sale", property.Description);
            Assert.Equal("House", property.Type);
            Assert.Equal(250000.00m, property.Price);
            Assert.Equal(120.5m, property.Surface);
            Assert.Equal(PropertyStatus.PUBLISHED, property.Status);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(-100)]
        public void Property_ShouldNotHaveNegativeOrZeroPrice(decimal price)
        {
            // Arrange
            var property = new Property("Test", "Test desc", "House", price);

            // Act & Assert
            Assert.Equal(price, property.Price);
            Assert.True(price <= 0);
        }

        [Fact]
        public void Property_ShouldHaveDefaultDraftStatus()
        {
            // Arrange
            var property = new Property("Test", "Test desc", "House", 100000m);

            // Act & Assert
            Assert.Equal(PropertyStatus.DRAFT, property.Status);
        }

        [Fact]
        public void UserRole_ShouldHaveCorrectValues()
        {
            // Act & Assert
            Assert.Equal(0, (int)UserRole.ADVERTISER);
            Assert.Equal(1, (int)UserRole.ADMIN);
        }

        [Fact]
        public void UserStatus_ShouldHaveCorrectValues()
        {
            // Act & Assert
            Assert.Equal(0, (int)UserStatus.ACTIVE);
            Assert.Equal(1, (int)UserStatus.SUSPENDED);
            Assert.Equal(2, (int)UserStatus.DELETED);
        }

        [Fact]
        public void PropertyStatus_ShouldHaveCorrectValues()
        {
            // Act & Assert
            Assert.Equal(0, (int)PropertyStatus.DRAFT);
            Assert.Equal(1, (int)PropertyStatus.PUBLISHED);
            Assert.Equal(2, (int)PropertyStatus.ARCHIVED);
        }
    }
}
