package it.unito.tweb.backendpostgres.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.unito.tweb.backendpostgres.model.entity.PersonDetails;
import it.unito.tweb.backendpostgres.model.projection.PersonDetailsProjection;
import it.unito.tweb.backendpostgres.model.projection.PersonAlternateNameProjection;
import it.unito.tweb.backendpostgres.model.projection.PersonVoiceWorkProjection;
import it.unito.tweb.backendpostgres.model.repository.PersonDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/person")
@CrossOrigin
@Tag(name = "People", description = "Endpoints for retrieving details about people (Voice Actors, Staff)")
public class PersonController {

    private final PersonDetailsRepository personRepo;

    public PersonController(PersonDetailsRepository personRepo) {
        this.personRepo = personRepo;
    }

    @Operation(
            summary = "Get person details",
            description = "Retrieves detailed information about a person, including their biography, alternate names, and voice acting roles."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Person details found",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(example = "{\"person\": {\"name\": \"Kana Hanazawa\", \"imageUrl\": \"...\"}, \"alternateNames\": [\"HanaKana\"], \"voiceWorks\": [...]}")
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Person not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public Map<String, Object> getPerson(
            @Parameter(description = "The MyAnimeList ID of the person", required = true, example = "185")
            @PathVariable Integer id
    ) {
        PersonDetailsProjection details = personRepo.findPersonDetails(id);
        if (details == null) {
            throw new RuntimeException("Person not found");
        }

        List<PersonAlternateNameProjection> altRows = personRepo.findAlternateNames(id);
        List<PersonVoiceWorkProjection> workRows = personRepo.findVoiceWorks(id);

        Map<String, Object> person = new HashMap<>();
        person.put("personMalId", details.getPersonMalId());
        person.put("name", details.getName());
        person.put("givenName", details.getGivenName());
        person.put("familyName", details.getFamilyName());
        person.put("birthday", details.getBirthday());
        person.put("websiteUrl", details.getWebsiteUrl());
        person.put("imageUrl", details.getImageUrl());

        List<String> alternateNames = altRows.stream()
                .map(PersonAlternateNameProjection::getAlternateName)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<Map<String, Object>> voiceWorks = workRows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("animeMalId", r.getAnimeMalId());
            m.put("animeTitle", r.getAnimeTitle());
            m.put("characterMalId", r.getCharacterMalId());
            m.put("characterName", r.getCharacterName());
            m.put("role", r.getRole());
            m.put("language", r.getLanguage());
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("person", person);
        result.put("alternateNames", alternateNames);
        result.put("voiceWorks", voiceWorks);
        return result;
    }

    @Operation(
            summary = "Batch retrieve people details",
            description = "Accepts a list of Person IDs and returns details for each. Useful for lists or favorites."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of people details returned",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = PersonDetails.class))
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Bad Request (empty ID list)", content = @Content)
    })
    @PostMapping("/batch")
    public ResponseEntity<List<PersonDetails>> getPeopleBatch(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "JSON object containing a list of Person IDs",
                    required = true,
                    content = @Content(
                            schema = @Schema(example = "{\"ids\": [185, 118, 65]}")
                    )
            )
            @RequestBody Map<String, List<Integer>> request
    ) {
        List<Integer> ids = request.get("ids");

        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Usa il metodo che abbiamo aggiunto al repository
        List<PersonDetails> people = personRepo.findAllByPersonMalIdIn(ids);

        return ResponseEntity.ok(people);
    }
}
