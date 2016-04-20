
package Model;

import java.io.Serializable;


public class Page implements Serializable {
    private String lectureID;
    private String pageID;
    private String pageSequence;
    private String pageAudioURL;

    public String getLectureID() {
        return lectureID;
    }

    public void setLectureID(String lectureID) {
        this.lectureID = lectureID;
    }

    public String getPageID() {
        return pageID;
    }

    public void setPageID(String pageID) {
        this.pageID = pageID;
    }

    public String getPageSequence() {
        return pageSequence;
    }

    public void setPageSequence(String pageSequence) {
        this.pageSequence = pageSequence;
    }

    public String getPageAudioURL() {
        return pageAudioURL;
    }

    public void setPageAudioURL(String pageAudioURL) {
        this.pageAudioURL = pageAudioURL;
    }
}
