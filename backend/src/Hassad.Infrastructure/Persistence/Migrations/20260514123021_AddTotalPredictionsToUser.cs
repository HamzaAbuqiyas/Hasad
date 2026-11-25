using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hassad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalPredictionsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileCompleted",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ProfileCompleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
