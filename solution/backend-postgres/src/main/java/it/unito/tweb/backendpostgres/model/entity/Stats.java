package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stats")
public class Stats {

    @Id
    @Column(name = "mal_id")
    private Integer malId;

    private Integer watching;
    private Integer completed;

    @Column(name = "on_hold")
    private Integer onHold;

    private Integer dropped;

    @Column(name = "plan_to_watch")
    private Integer planToWatch;

    private Integer total;

    @Column(name = "score_1_votes")       private Double score1Votes;
    @Column(name = "score_1_percentage")  private Double score1Percentage;
    @Column(name = "score_2_votes")       private Double score2Votes;
    @Column(name = "score_2_percentage")  private Double score2Percentage;
    @Column(name = "score_3_votes")       private Double score3Votes;
    @Column(name = "score_3_percentage")  private Double score3Percentage;
    @Column(name = "score_4_votes")       private Double score4Votes;
    @Column(name = "score_4_percentage")  private Double score4Percentage;
    @Column(name = "score_5_votes")       private Double score5Votes;
    @Column(name = "score_5_percentage")  private Double score5Percentage;
    @Column(name = "score_6_votes")       private Double score6Votes;
    @Column(name = "score_6_percentage")  private Double score6Percentage;
    @Column(name = "score_7_votes")       private Double score7Votes;
    @Column(name = "score_7_percentage")  private Double score7Percentage;
    @Column(name = "score_8_votes")       private Double score8Votes;
    @Column(name = "score_8_percentage")  private Double score8Percentage;
    @Column(name = "score_9_votes")       private Double score9Votes;
    @Column(name = "score_9_percentage")  private Double score9Percentage;
    @Column(name = "score_10_votes")      private Double score10Votes;
    @Column(name = "score_10_percentage") private Double score10Percentage;

    public Integer getMalId() { return malId; }
    public Integer getWatching() { return watching; }
    public Integer getCompleted() { return completed; }
    public Integer getOnHold() { return onHold; }
    public Integer getDropped() { return dropped; }
    public Integer getPlanToWatch() { return planToWatch; }
    public Integer getTotal() { return total; }

    public Double getScore1Votes() { return score1Votes; }
    public Double getScore1Percentage() { return score1Percentage; }
    public Double getScore2Votes() { return score2Votes; }
    public Double getScore2Percentage() { return score2Percentage; }
    public Double getScore3Votes() { return score3Votes; }
    public Double getScore3Percentage() { return score3Percentage; }
    public Double getScore4Votes() { return score4Votes; }
    public Double getScore4Percentage() { return score4Percentage; }
    public Double getScore5Votes() { return score5Votes; }
    public Double getScore5Percentage() { return score5Percentage; }
    public Double getScore6Votes() { return score6Votes; }
    public Double getScore6Percentage() { return score6Percentage; }
    public Double getScore7Votes() { return score7Votes; }
    public Double getScore7Percentage() { return score7Percentage; }
    public Double getScore8Votes() { return score8Votes; }
    public Double getScore8Percentage() { return score8Percentage; }
    public Double getScore9Votes() { return score9Votes; }
    public Double getScore9Percentage() { return score9Percentage; }
    public Double getScore10Votes() { return score10Votes; }
    public Double getScore10Percentage() { return score10Percentage; }
}
