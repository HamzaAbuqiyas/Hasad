using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hassad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProfileUpdate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "FarmSize",
                table: "Users",
                type: "float",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsProfileCompleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProfileCompleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProfileCompleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfileCompleted",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "FarmSize",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);
        }
    }
}
