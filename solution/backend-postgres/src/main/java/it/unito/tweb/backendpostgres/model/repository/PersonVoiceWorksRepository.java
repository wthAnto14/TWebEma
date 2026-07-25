package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.PersonVoiceWorks;
import it.unito.tweb.backendpostgres.model.entity.PersonVoiceWorksId;
import it.unito.tweb.backendpostgres.model.projection.VoiceActorProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PersonVoiceWorksRepository
        extends JpaRepository<PersonVoiceWorks, PersonVoiceWorksId> {

    @Query(value = """
        SELECT pvw.person_mal_id AS personMalId,
               c.name        AS characterName,
               pvw.role      AS role,
               p.name        AS personName,
               pvw.language  AS language
        FROM person_voice_works pvw
        JOIN characters c ON pvw.character_mal_id = c.character_mal_id
        JOIN person_details p ON pvw.person_mal_id = p.person_mal_id
        WHERE pvw.anime_mal_id = :animeId
        """, nativeQuery = true)
    List<VoiceActorProjection> findVoiceActorsByAnimeId(@Param("animeId") Integer animeId);
}
