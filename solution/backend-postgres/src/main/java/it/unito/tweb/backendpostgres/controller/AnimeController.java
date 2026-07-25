package it.unito.tweb.backendpostgres.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.unito.tweb.backendpostgres.model.dto.AnimePageData;
import it.unito.tweb.backendpostgres.model.entity.AnimeDetails;
import it.unito.tweb.backendpostgres.model.entity.Stats;
import it.unito.tweb.backendpostgres.model.projection.AnimeCharacterProjection;
import it.unito.tweb.backendpostgres.model.projection.AnimeListItem;
import it.unito.tweb.backendpostgres.model.projection.VoiceActorProjection;
import it.unito.tweb.backendpostgres.model.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/anime")
@Tag(name = "Anime", description = "Endpoints for managing and retrieving anime information")
public class AnimeController {

    private final AnimeDetailsRepository animeRepo;
    private final StatsRepository statsRepo;
    private final CharacterAnimeWorksRepository cawRepo;
    private final PersonVoiceWorksRepository pvwRepo;
    private final RecommendationsRepository recoRepo;

    public AnimeController(AnimeDetailsRepository animeRepo,
                           StatsRepository statsRepo,
                           CharacterAnimeWorksRepository cawRepo,
                           PersonVoiceWorksRepository pvwRepo,
                           RecommendationsRepository recoRepo) {
        this.animeRepo = animeRepo;
        this.statsRepo = statsRepo;
        this.cawRepo = cawRepo;
        this.pvwRepo = pvwRepo;
        this.recoRepo = recoRepo;
    }

    @Operation(
            summary = "Search for anime by title",
            description = "Returns a simplified list of anime matching the title provided. The result is optimized for search dropdowns or list views."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successful retrieval of anime list",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = AnimeListItem.class))
                    )
            )
    })
    @GetMapping("/search")
    public List<AnimeListItem> search(
            @Parameter(description = "The title (or partial title) to search for", required = true, example = "Naruto")
            @RequestParam String title
    ) {
        return animeRepo.findAllForList(title);
    }

    @Operation(
            summary = "Get full anime details",
            description = "Retrieves comprehensive information for a specific anime ID, including statistics, characters, voice actors, and recommendations."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Anime found and details returned",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AnimePageData.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Anime not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<AnimePageData> getAnimePageData(
            @Parameter(description = "The MyAnimeList ID of the anime", required = true, example = "20")
            @PathVariable Integer id
    ) {
        AnimeDetails anime = animeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Anime not found"));

        Stats stats = statsRepo.findById(id).orElse(null);
        List<AnimeCharacterProjection> characters = cawRepo.findCharactersByAnimeId(id);
        List<VoiceActorProjection> voiceActors = pvwRepo.findVoiceActorsByAnimeId(id);
        List<Integer> recommendationIds = recoRepo.findRecommendationMalIdsByMalId(id);
        List<AnimeDetails> recommendedAnimes = animeRepo.findAllByMalIdIn(recommendationIds);

        AnimePageData pageData = new AnimePageData(anime, stats, characters, voiceActors, recommendedAnimes);
        return ResponseEntity.ok(pageData);
    }

    @Operation(
            summary = "Batch retrieve anime details",
            description = "Accepts a list of Anime IDs and returns detailed information for each valid ID found. Useful for enriching lists or favorites."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of anime details returned successfully",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = AnimeDetails.class))
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad Request (e.g., missing or empty ID list)", content = @Content)
    })
    @PostMapping("/batch")
    public ResponseEntity<List<AnimeDetails>> getAnimeBatch(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON object containing a list of IDs",
                    required = true,
                    content = @Content(
                            schema = @Schema(example = "{\"ids\": [1, 20, 1535]}")
                    )
            )
            @RequestBody Map<String, List<Integer>> request
    ) {
        List<Integer> ids = request.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<AnimeDetails> animes = animeRepo.findAllByMalIdIn(ids);
        return ResponseEntity.ok(animes);
    }
}
