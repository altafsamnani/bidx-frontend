<?php

/**
 * Gather staticdata
 *
 * @author Jaap Gorjup
 * @version 1.0
 */
class MailService extends APIbridge
{

    /**
     * Constructs the API bridge.
     * Needed for operational logging.
     */
    public function __construct ()
    {
        parent :: __construct ();
    }

    /**
     * Get Template Messages
     * @Todo - Replace with new editing / multilingual later stage
     *
     * @param string $type Message Template type
     * @return array $data Message Template array
     */
    
    public function getMessageTemplate ($type = NULL)
    {


        $filename = BIDX_PLUGIN_DIR . '/../pages/message.xml';
        //try /catch / log ignore
        $document = simplexml_load_file ($filename);        
        $messages = $document->xpath ('//message');
        
        foreach ($messages as $message) {
            
            $templateLibrary = new TemplateLibrary();
            $body    = $templateLibrary->replaceMessageTokens($message->content);
            $subject = $templateLibrary->replaceMessageTokens($message->subject);

            if ($message->name == $type) {
                $data['subject'] = $subject;
                $data['content'] = $body;
            } else {
                $data[$message->name]['subject'] = $subject;
                $data[$message->name]['content'] = $body;
            }
            
        }

        return $data;
    }



}

?>
