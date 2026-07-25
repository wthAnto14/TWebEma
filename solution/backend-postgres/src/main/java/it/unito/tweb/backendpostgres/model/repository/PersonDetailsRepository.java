package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.PersonDetails;
import it.unito.tweb.backendpostgres.model.projection.PersonDetailsProjection;
import it.unito.tweb.backendpostgres.model.projection.PersonAlternateNameProjection;
import it.unito.tweb.backendpostgres.model.projection.PersonVoiceWorkProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PersonDetailsRepository extends JpaRepository<PersonDetails, Integer> {

    @Query("""
        SELECT pd.personMalId      AS personMalId,
               pd.websiteUrl       AS websiteUrl,
               pd.imageUrl         AS imageUrl,
               pd.name             AS name,
               pd.givenName        AS givenName,
               pd.familyName       AS familyName,
               pd.birthday         AS birthday,
               pd.favorites        AS favorites,
               pd.relevantLocation AS relevantLocation
        FROM PersonDetails pd
        WHERE pd.personMalId = :id
        """)
    PersonDetailsProjection findPersonDetails(@Param("id") Integer id);

    @Query(value = """
        SELECT pan.alt_name AS altName
        FROM person_alternate_names pan
        WHERE pan.person_mal_id = :id
        """, nativeQuery = true)
    List<PersonAlternateNameProjection> findAlternateNames(@Param("id") Integer id);

    @Query(value = """
        SELECT pvw.anime_mal_id     AS animeMalId,
               ad.title             AS animeTitle,
               pvw.character_mal_id AS characterMalId,
               c.name               AS characterName,
               pvw.role             AS role,
               pvw.language         AS language
        FROM person_voice_works pvw
        JOIN anime_details ad   ON ad.mal_id = pvw.anime_mal_id
        JOIN characters c       ON c.character_mal_id = pvw.character_mal_id
        WHERE pvw.person_mal_id = :id
        ORDER BY ad.title, c.name
        """, nativeQuery = true)
    List<PersonVoiceWorkProjection> findVoiceWorks(@Param("id") Integer id);
    List<PersonDetails> findAllByPersonMalIdIn(List<Integer> ids);
}
