package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.projection.AnimeListItem;
import it.unito.tweb.backendpostgres.model.entity.AnimeDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnimeDetailsRepository extends JpaRepository<AnimeDetails, Integer> {

    // Restituisce gli anime il cui title contiene la stringa cercata (case-insensitive)
    List<AnimeDetails> findByTitleIgnoreCaseContaining(String title);

    @Query("""
        SELECT a.malId as malId,
               a.title AS title,
               a.titleJapanese AS titleJapanese,
               a.imageUrl AS imageUrl,
               a.type AS type,
               a.score AS score
        FROM AnimeDetails a
        WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))
        """)

    List<AnimeListItem> findAllForList(String title);

    List<AnimeDetails> findAllByMalIdIn(List<Integer> ids);
}
