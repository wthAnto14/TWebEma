package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.CharacterAnimeWorks;
import it.unito.tweb.backendpostgres.model.entity.CharacterAnimeWorksId;
import it.unito.tweb.backendpostgres.model.projection.AnimeCharacterProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CharacterAnimeWorksRepository
        extends JpaRepository<CharacterAnimeWorks, CharacterAnimeWorksId> {

    @Query(value = """
        SELECT c.character_mal_id AS characterMalId,
               c.name            AS name,
               c.image           AS image,
               caw.role          AS role
        FROM character_anime_works caw
        JOIN characters c ON caw.character_mal_id = c.character_mal_id
        WHERE caw.anime_mal_id = :animeId
        """, nativeQuery = true)
    List<AnimeCharacterProjection> findCharactersByAnimeId(@Param("animeId") Integer animeId);

}
