using Xunit;
using Back_end.Models;

namespace Back_end.Test
{
    public class TestImage
    {
        [Fact]
        public void Image_ShouldCreateWithRequiredParameter()
        {
            // Arrange & Act
            var image = new Image("https://example.com/image.jpg");

            // Assert
            Assert.NotNull(image);
            Assert.NotEqual(Guid.Empty, image.Id);
            Assert.Equal("https://example.com/image.jpg", image.Url);
            Assert.Equal(0, image.Order);
        }

        [Fact]
        public void Image_ShouldAllowOrderUpdate()
        {
            // Arrange
            var image = new Image("https://example.com/image.jpg");

            // Act
            image.Order = 1;

            // Assert
            Assert.Equal(1, image.Order);
        }

        [Theory]
        [InlineData("https://s3.amazonaws.com/bucket/image1.jpg")]
        [InlineData("https://cdn.example.com/photo.png")]
        [InlineData("https://storage.googleapis.com/house_exterior.jpeg")]
        public void Image_ShouldAcceptVariousUrls(string url)
        {
            // Arrange & Act
            var image = new Image(url);

            // Assert
            Assert.Equal(url, image.Url);
        }

        [Fact]
        public void Image_ShouldAllowPropertyNavigation()
        {
            // Arrange
            var image = new Image("https://example.com/image.jpg");
            var property = new Property("Test House", "Description", "House", 100000m);

            // Act
            image.Property = property;

            // Assert
            Assert.NotNull(image.Property);
            Assert.Equal(property, image.Property);
        }
    }
}
