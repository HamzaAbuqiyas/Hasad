using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hassad.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixCreatePredictionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Predictions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Crop = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetYear = table.Column<int>(type: "int", nullable: false),
                    Season = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PredictedProduction = table.Column<double>(type: "float", nullable: true),
                    Quality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PriceTrend = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RawAiResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Predictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Predictions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_UserId",
                table: "Predictions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Predictions");
        }
    }
}
