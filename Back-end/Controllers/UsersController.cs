using Microsoft.AspNetCore.Mvc;
using Back_end.Models;
using Back_end.Persistence;
using Back_end.Enums;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
    private readonly UserRepository _repository;

        public UsersController(UserRepository repository)
        {
            _repository = repository;
        }

        public record RegisterUserRequest(
            string Email,
            string Password,
            bool IsAdmin = false);

        public record LoginRequest(
            string Email,
            string Password);

        public record AuthResponse(
            Guid Id,
            string Email,
            bool IsAdmin,
            string Token);

        private string GenerateToken(User user)
        {
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret missing");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("isAdmin", (user.Role == UserRole.ADMIN).ToString().ToLower())
            };

            var expires = DateTime.UtcNow.AddMinutes(60);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _repository.GetByEmailAsync(request.Email);
            if (user == null)
                return BadRequest("Invalid email or password");

            bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!validPassword)
                return BadRequest("Invalid email or password");

            if (user.Status != UserStatus.ACTIVE)
                return BadRequest("Account is not active");

            var token = GenerateToken(user);
            return Ok(new AuthResponse(user.Id, user.Email, user.Role == UserRole.ADMIN, token));
        }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterUserRequest request)
        {
            var existingUser = await _repository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest("Email already exists");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User(
                email: request.Email,
                passwordHash: hashedPassword
            )
            {
                Role = request.IsAdmin ? UserRole.ADMIN : UserRole.ADVERTISER,
                Status = UserStatus.ACTIVE
            };

            var created = await _repository.CreateAsync(user);
            var token = GenerateToken(created);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, new AuthResponse(created.Id, created.Email, created.Role == UserRole.ADMIN, token));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _repository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(Guid id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        public record UpdateUserRequest(
            bool IsAdmin,
            UserStatus Status);

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            user.Role = request.IsAdmin ? UserRole.ADMIN : UserRole.ADVERTISER;
            user.Status = request.Status;

            var success = await _repository.UpdateAsync(user);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}
