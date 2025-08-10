using Microsoft.AspNetCore.Mvc;
using Back_end.Models;
using Back_end.Persistence;
using Back_end.Enums;

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

        public record LoginResponse(
            Guid Id,
            string Email,
            UserRole Role,
            UserStatus Status,
            DateTime CreatedAt);

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            var user = await _repository.GetByEmailAsync(request.Email);
            if (user == null)
                return BadRequest("Invalid email or password");

            bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!validPassword)
                return BadRequest("Invalid email or password");

            if (user.Status != UserStatus.ACTIVE)
                return BadRequest("Account is not active");

            return Ok(new LoginResponse(user.Id, user.Email, user.Role, user.Status, user.CreatedAt));
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register(RegisterUserRequest request)
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
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, new LoginResponse(created.Id, created.Email, created.Role, created.Status, created.CreatedAt));
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
