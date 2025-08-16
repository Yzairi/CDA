using Xunit;
using Back_end.Enums;

namespace Back_end.Test
{
    public class TestEnums
    {
        [Fact]
        public void UserRole_ShouldHaveCorrectValues()
        {
            // Act & Assert
            Assert.Equal(0, (int)UserRole.ADVERTISER);
            Assert.Equal(1, (int)UserRole.ADMIN);
        }

        [Fact]
        public void UserRole_ShouldHaveCorrectNames()
        {
            // Act & Assert
            Assert.Equal("ADVERTISER", UserRole.ADVERTISER.ToString());
            Assert.Equal("ADMIN", UserRole.ADMIN.ToString());
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
        public void UserStatus_ShouldHaveCorrectNames()
        {
            // Act & Assert
            Assert.Equal("ACTIVE", UserStatus.ACTIVE.ToString());
            Assert.Equal("SUSPENDED", UserStatus.SUSPENDED.ToString());
            Assert.Equal("DELETED", UserStatus.DELETED.ToString());
        }

        [Fact]
        public void PropertyStatus_ShouldHaveCorrectValues()
        {
            // Act & Assert
            Assert.Equal(0, (int)PropertyStatus.DRAFT);
            Assert.Equal(1, (int)PropertyStatus.PUBLISHED);
            Assert.Equal(2, (int)PropertyStatus.ARCHIVED);
        }

        [Fact]
        public void PropertyStatus_ShouldHaveCorrectNames()
        {
            // Act & Assert
            Assert.Equal("DRAFT", PropertyStatus.DRAFT.ToString());
            Assert.Equal("PUBLISHED", PropertyStatus.PUBLISHED.ToString());
            Assert.Equal("ARCHIVED", PropertyStatus.ARCHIVED.ToString());
        }

        [Theory]
        [InlineData(UserRole.ADVERTISER)]
        [InlineData(UserRole.ADMIN)]
        public void UserRole_ShouldBeValidEnumValues(UserRole role)
        {
            // Act & Assert
            Assert.True(Enum.IsDefined(typeof(UserRole), role));
        }

        [Theory]
        [InlineData(UserStatus.ACTIVE)]
        [InlineData(UserStatus.SUSPENDED)]
        [InlineData(UserStatus.DELETED)]
        public void UserStatus_ShouldBeValidEnumValues(UserStatus status)
        {
            // Act & Assert
            Assert.True(Enum.IsDefined(typeof(UserStatus), status));
        }

        [Theory]
        [InlineData(PropertyStatus.DRAFT)]
        [InlineData(PropertyStatus.PUBLISHED)]
        [InlineData(PropertyStatus.ARCHIVED)]
        public void PropertyStatus_ShouldBeValidEnumValues(PropertyStatus status)
        {
            // Act & Assert
            Assert.True(Enum.IsDefined(typeof(PropertyStatus), status));
        }
    }
}
