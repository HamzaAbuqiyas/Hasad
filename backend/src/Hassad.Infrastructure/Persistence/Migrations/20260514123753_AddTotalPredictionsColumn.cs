using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hassad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalPredictionsColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalPredictions",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalPredictions",
                table: "Users");
        }
    }
}
