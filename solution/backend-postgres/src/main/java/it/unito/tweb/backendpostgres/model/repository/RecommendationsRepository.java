package it.unito.tweb.backendpostgres.model.repository;

import it.unito.tweb.backendpostgres.model.entity.Recommendations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RecommendationsRepository extends JpaRepository<Recommendations, Integer> {
    @Query("SELECT DISTINCT r.recommendationMalId FROM Recommendations r WHERE r.malId = :malId")
    List<Integer> findRecommendationMalIdsByMalId(@Param("malId") Integer malId);
}
