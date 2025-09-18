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
    /// <summary>
    /// Contrôleur pour la gestion des utilisateurs
    /// Gère l'authentification, l'inscription et la gestion des comptes utilisateurs
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserRepository _repository;

        public UsersController(UserRepository repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Modèle de requête pour l'inscription d'un nouvel utilisateur
        /// </summary>
        /// <param name="Email">Adresse email de l'utilisateur (unique)</param>
        /// <param name="Password">Mot de passe en clair (sera hashé)</param>
        /// <param name="IsAdmin">Si l'utilisateur est administrateur (défaut: false)</param>
        public record RegisterUserRequest(
            string Email,
            string Password,
            bool IsAdmin = false);

        /// <summary>
        /// Modèle de requête pour la connexion
        /// </summary>
        /// <param name="Email">Adresse email de l'utilisateur</param>
        /// <param name="Password">Mot de passe en clair</param>
        public record LoginRequest(
            string Email,
            string Password);

        /// <summary>
        /// Modèle de réponse d'authentification
        /// </summary>
        /// <param name="Id">ID unique de l'utilisateur</param>
        /// <param name="Email">Adresse email de l'utilisateur</param>
        /// <param name="IsAdmin">Si l'utilisateur est administrateur</param>
        /// <param name="Token">Token JWT pour l'authentification</param>
        public record AuthResponse(
            Guid Id,
            string Email,
            bool IsAdmin,
            string Token);

        /// <summary>
        /// Génère un token JWT pour l'utilisateur authentifié
        /// </summary>
        /// <param name="user">Utilisateur pour lequel générer le token</param>
        /// <returns>Token JWT signé</returns>
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

        /// <summary>
        /// Connexion d'un utilisateur
        /// </summary>
        /// <param name="request">Requête de connexion contenant l'email et le mot de passe</param>
        /// <returns>Réponse d'authentification avec le token JWT</returns>
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

        /// <summary>
        /// Inscription d'un nouvel utilisateur
        /// </summary>
        /// <param name="request">Requête d'inscription contenant l'email, le mot de passe et le statut d'administrateur</param>
        /// <returns>Réponse d'authentification avec le token JWT</returns>
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
            return Created($"/api/Users/{created.Id}", new AuthResponse(created.Id, created.Email, created.Role == UserRole.ADMIN, token));
        }

        /// <summary>
        /// Récupère tous les utilisateurs
        /// </summary>
        /// <returns>Liste de tous les utilisateurs</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _repository.GetAllAsync();
            return Ok(users);
        }

        /// <summary>
        /// Modèle de requête pour la mise à jour d'un utilisateur
        /// </summary>
        /// <param name="IsAdmin">Si l'utilisateur est administrateur</param>
        /// <param name="Status">Statut de l'utilisateur</param>
        public record UpdateUserRequest(
            bool IsAdmin,
            UserStatus Status);

        /// <summary>
        /// Met à jour un utilisateur existant
        /// </summary>
        /// <param name="id">ID de l'utilisateur à mettre à jour</param>
        /// <param name="request">Requête de mise à jour contenant les nouvelles valeurs</param>
        /// <returns>Résultat de l'opération de mise à jour</returns>
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

        /// <summary>
        /// Récupère l'adresse email d'un utilisateur par son ID
        /// </summary>
        /// <param name="id">ID de l'utilisateur</param>
        /// <returns>Adresse email de l'utilisateur</returns>
        [HttpGet("{id}/email")]
        public async Task<ActionResult<string>> GetUserEmail(Guid id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user.Email);
        }

        /// <summary>
        /// Supprime un utilisateur par son ID
        /// </summary>
        /// <param name="id">ID de l'utilisateur à supprimer</param>
        /// <returns>Résultat de l'opération de suppression</returns>
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
