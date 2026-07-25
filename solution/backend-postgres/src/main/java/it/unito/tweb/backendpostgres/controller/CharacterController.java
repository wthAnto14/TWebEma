package it.unito.tweb.backendpostgres.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.unito.tweb.backendpostgres.model.entity.CharacterDetails;
import it.unito.tweb.backendpostgres.model.repository.CharacterDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/characters")
@Tag(name = "Characters", description = "Endpoints for retrieving character information")
public class CharacterController {

    private final CharacterDetailsRepository charRepo;

    public CharacterController(CharacterDetailsRepository charRepo) {
        this.charRepo = charRepo;
    }

    @Operation(
            summary = "Batch retrieve character details",
            description = "Accepts a list of Character IDs and returns detailed information for each valid ID found. Used to populate character lists or favorites."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of character details returned successfully",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = CharacterDetails.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad Request (e.g., missing or empty ID list)",
                    content = @Content
            )
    })
    @PostMapping("/batch")
    public ResponseEntity<List<CharacterDetails>> getCharactersBatch(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON object containing a list of Character IDs",
                    required = true,
                    content = @Content(
                            schema = @Schema(example = "{\"ids\": [1, 40, 102]}")
                    )
            )
            @RequestBody Map<String, List<Integer>> request
    ) {
        List<Integer> ids = request.get("ids");

        // Validazione base
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Recupera i dati dal DB
        List<CharacterDetails> characters = charRepo.findAllByMalIdIn(ids);
        return ResponseEntity.ok(characters);
    }
}
